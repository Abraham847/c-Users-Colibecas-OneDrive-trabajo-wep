import { Router, Request, Response } from 'express';
import { Email } from '../models/Email';
import { authenticate } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const emails = await Email.find({ userId: req.user!.id });
    res.json({ success: true, data: emails });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const email = await Email.create({ ...req.body, userId: req.user!.id });
    res.status(201).json({ success: true, data: email });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, error: error.message });
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const email = await Email.findOne({ _id: req.params.id, userId: req.user!.id });
    if (!email) {
      res.status(404).json({ success: false, error: 'Correo no encontrado' });
      return;
    }
    res.json({ success: true, data: email });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const email = await Email.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!.id },
      req.body,
      { new: true }
    );
    if (!email) {
      res.status(404).json({ success: false, error: 'Correo no encontrado' });
      return;
    }
    res.json({ success: true, data: email });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await Email.findOneAndDelete({ _id: req.params.id, userId: req.user!.id });
    res.json({ success: true, message: 'Correo eliminado' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
