import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AuthRequest, UserPayload } from '../types';
import { logger } from '../utils/logger';

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'Token de acceso requerido' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret) as UserPayload;

    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ success: false, error: 'Token expirado', code: 'TOKEN_EXPIRED' });
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ success: false, error: 'Token inválido', code: 'INVALID_TOKEN' });
      return;
    }
    logger.error('Auth middleware error:', error);
    res.status(500).json({ success: false, error: 'Error de autenticación' });
  }
};

export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, config.jwt.secret) as UserPayload;
      req.user = decoded;
    }
  } catch {
    // No auth required
  }
  next();
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'superadmin')) {
    res.status(403).json({ success: false, error: 'Acceso denegado. Se requieren permisos de administrador.' });
    return;
  }
  next();
};

export const requireSuperAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== 'superadmin') {
    res.status(403).json({ success: false, error: 'Acceso denegado. Se requieren permisos de superadministrador.' });
    return;
  }
  next();
};
