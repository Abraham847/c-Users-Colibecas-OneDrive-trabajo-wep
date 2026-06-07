import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export class AppError extends Error {
  statusCode: number;
  code?: string;

  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      code: err.code,
    });
    return;
  }

  logger.error('Unhandled error:', err);

  res.status(500).json({
    success: false,
    error: 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { details: err.message }),
  });
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
};
