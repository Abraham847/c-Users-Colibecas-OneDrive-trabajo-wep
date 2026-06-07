import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { CodeAuthService } from '../services/CodeAuthService';
import { authenticate } from '../middleware/auth';
import { AuthRequest } from '../types';
import { config } from '../config';
import { User } from '../models/User';

const router = Router();

router.post('/create-code', async (req: Request, res: Response) => {
  try {
    const code = await CodeAuthService.createCode();
    res.json({ success: true, data: { code } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/use-code', async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    if (!code) {
      res.status(400).json({ success: false, error: 'Código requerido' });
      return;
    }

    const entry = await CodeAuthService.useCode(code.toUpperCase());
    if (!entry) {
      res.status(401).json({ success: false, error: 'Código inválido o ya usado' });
      return;
    }

    let user = await User.findOne({ codeId: entry.userId });
    if (!user) {
      user = await User.create({
        email: `${entry.userId}@code.local`,
        name: entry.userName,
        password: uuidv4(),
        emailVerified: true,
        codeId: entry.userId,
      });
    }

    const payload = { id: user._id.toString(), email: user.email, role: user.role, plan: user.plan };
    const accessToken = jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
    const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshExpiresIn });

    user.lastLogin = new Date();
    await user.save();

    res.json({ success: true, data: { user, tokens: { accessToken, refreshToken } } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({ success: false, error: 'Token requerido' });
      return;
    }
    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as jwt.JwtPayload;
    const user = await User.findById(decoded.id);
    if (!user) {
      res.status(404).json({ success: false, error: 'Usuario no encontrado' });
      return;
    }
    const payload = { id: user._id.toString(), email: user.email, role: user.role, plan: user.plan };
    const accessToken = jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
    const newRefreshToken = jwt.sign(payload, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshExpiresIn });
    res.json({ success: true, data: { user, tokens: { accessToken, refreshToken: newRefreshToken } } });
  } catch (err) {
    res.status(401).json({ success: false, error: 'Token de actualización inválido' });
  }
});

router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) {
      res.status(404).json({ success: false, error: 'Usuario no encontrado' });
      return;
    }
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/codes', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
      res.status(403).json({ success: false, error: 'No autorizado' });
      return;
    }
    const codes = await CodeAuthService.getCodes();
    res.json({ success: true, data: codes });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
