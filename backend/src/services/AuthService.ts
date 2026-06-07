import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../config';
import { User, IUser } from '../models/User';
import { AppError } from '../middleware/errorHandler';

export class AuthService {
  static generateTokens(user: IUser) {
    const payload = { id: user._id.toString(), email: user.email, role: user.role, plan: user.plan };
    const accessToken = jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn } as jwt.SignOptions);
    const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshExpiresIn } as jwt.SignOptions);
    return { accessToken, refreshToken };
  }

  static verifyRefreshToken(token: string) {
    return jwt.verify(token, config.jwt.refreshSecret) as jwt.JwtPayload;
  }

  static async refreshToken(refreshToken: string) {
    try {
      const decoded = this.verifyRefreshToken(refreshToken);
      const user = await User.findById(decoded.id);
      if (!user) throw new AppError('Usuario no encontrado', 404, 'USER_NOT_FOUND');
      const tokens = this.generateTokens(user);
      return { user, tokens };
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError('Token de actualización inválido', 401, 'INVALID_REFRESH_TOKEN');
    }
  }

  static async generateApiKey(userId: string) {
    const apiKey = `ch_${crypto.randomBytes(32).toString('hex')}`;
    await User.findByIdAndUpdate(userId, { apiKey });
    return apiKey;
  }
}