import mongoose, { Document, Schema } from 'mongoose';

export interface IEmail extends Document {
  userId: mongoose.Types.ObjectId;
  hostingPlanId: mongoose.Types.ObjectId;
  email: string;
  password: string;
  name: string;
  forwarders: string[];
  aliases: string[];
  quota: number;
  used: number;
  status: 'active' | 'suspended' | 'disabled';
  autoResponder?: {
    enabled: boolean;
    subject?: string;
    message?: string;
    startDate?: Date;
    endDate?: Date;
  };
  spamFilter: 'low' | 'normal' | 'high';
  webmail: boolean;
  imap: boolean;
  smtp: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const emailSchema = new Schema<IEmail>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    hostingPlanId: { type: Schema.Types.ObjectId, ref: 'HostingPlan', required: true },
    email: { type: String, required: true, lowercase: true, unique: true },
    password: { type: String, required: true, select: false },
    name: { type: String, required: true },
    forwarders: [String],
    aliases: [String],
    quota: { type: Number, default: 1073741824 },
    used: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'suspended', 'disabled'], default: 'active' },
    autoResponder: {
      enabled: { type: Boolean, default: false },
      subject: String,
      message: String,
      startDate: Date,
      endDate: Date,
    },
    spamFilter: { type: String, enum: ['low', 'normal', 'high'], default: 'normal' },
    webmail: { type: Boolean, default: true },
    imap: { type: Boolean, default: true },
    smtp: { type: Boolean, default: true },
    lastLogin: Date,
  },
  { timestamps: true }
);

export const Email = mongoose.model<IEmail>('Email', emailSchema);
