import rateLimit from 'express-rate-limit';

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, error: 'Demasiadas solicitudes, intente de nuevo más tarde' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { success: false, error: 'Demasiados intentos de inicio de sesión' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60,
  message: { success: false, error: 'Límite de API alcanzado' },
  standardHeaders: true,
  legacyHeaders: false,
});
