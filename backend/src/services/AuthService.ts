import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../config';
import { User, IUser } from '../models/User';
import { AppError } from '../middleware/errorHandler';
import { EmailService } from './EmailService';
import { logger } from '../utils/logger';

export class AuthService {
  static generateTokens(user: IUser) {
    const payload = { id: user._id.toString(), email: user.email, role: user.role, plan: user.plan };

    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });

    const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn,
    });

    return { accessToken, refreshToken };
  }

  static verifyRefreshToken(token: string) {
    return jwt.verify(token, config.jwt.refreshSecret) as jwt.JwtPayload;
  }

  static async register(data: { email: string; password: string; name: string }) {
    const existing = await User.findOne({ email: data.email.toLowerCase() });
    if (existing) {
      throw new AppError('El correo ya está registrado', 400, 'EMAIL_EXISTS');
    }

    const user = await User.create(data);
    const tokens = this.generateTokens(user);

    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 3600000);
    await user.save();

    try {
      await EmailService.sendVerificationEmail(user.email, verificationToken);
    } catch (err) {
      logger.warn('Failed to send verification email:', err);
    }

    return { user, tokens };
  }

  static async login(email: string, password: string) {
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      throw new AppError('Credenciales inválidas', 401, 'INVALID_CREDENTIALS');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError('Credenciales inválidas', 401, 'INVALID_CREDENTIALS');
    }

    user.lastLogin = new Date();
    await user.save();

    const tokens = this.generateTokens(user);
    return { user, tokens };
  }

  static async refreshToken(refreshToken: string) {
    try {
      const decoded = this.verifyRefreshToken(refreshToken);
      const user = await User.findById(decoded.id);
      if (!user) {
        throw new AppError('Usuario no encontrado', 404, 'USER_NOT_FOUND');
      }
      const tokens = this.generateTokens(user);
      return { user, tokens };
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError('Token de actualización inválido', 401, 'INVALID_REFRESH_TOKEN');
    }
  }

  static async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw new AppError('Usuario no encontrado', 404, 'USER_NOT_FOUND');
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new AppError('Contraseña actual incorrecta', 400, 'INVALID_PASSWORD');
    }

    user.password = newPassword;
    await user.save();
    return true;
  }

  static async generateApiKey(userId: string) {
    const apiKey = `ch_${crypto.randomBytes(32).toString('hex')}`;
    await User.findByIdAndUpdate(userId, { apiKey });
    return apiKey;
  }

  static async verifyEmail(token: string) {
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() },
    });
    if (!user) {
      throw new AppError('Token de verificación inválido o expirado', 400, 'INVALID_TOKEN');
    }
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();
    return true;
  }

  static async requestPasswordReset(email: string) {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return true;

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000);
    await user.save();

    try {
      await EmailService.sendPasswordResetEmail(user.email, resetToken);
    } catch (err) {
      logger.warn('Failed to send password reset email:', err);
    }
    return true;
  }

  static async resetPassword(token: string, newPassword: string) {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });
    if (!user) {
      throw new AppError('Token inválido o expirado', 400, 'INVALID_TOKEN');
    }
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    return true;
  }
}
