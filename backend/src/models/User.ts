import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  codeId?: string;
  role: 'user' | 'admin' | 'superadmin';
  plan: string;
  planStatus: 'active' | 'canceled' | 'past_due' | 'trialing';
  avatar?: string;
  phone?: string;
  company?: string;
  emailVerified: boolean;
  apiKey?: string;
  preferences: {
    language: string;
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
  };
  storage: {
    used: number;
    total: number;
  };
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    codeId: { type: String, unique: true, sparse: true },
    role: { type: String, enum: ['user', 'admin', 'superadmin'], default: 'user' },
    plan: { type: String, default: 'free' },
    planStatus: { type: String, enum: ['active', 'canceled', 'past_due', 'trialing'], default: 'active' },
    avatar: { type: String },
    phone: { type: String },
    company: { type: String },
    emailVerified: { type: Boolean, default: true },
    apiKey: { type: String, unique: true, sparse: true },
    preferences: {
      language: { type: String, default: 'es' },
      theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
      notifications: { type: Boolean, default: true },
    },
    storage: {
      used: { type: Number, default: 0 },
      total: { type: Number, default: 1073741824 },
    },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

userSchema.set('toJSON', {
  transform: (doc, ret) => {
    const { password, ...rest } = ret;
    return rest;
  },
});

export const User = mongoose.model<IUser>('User', userSchema);
