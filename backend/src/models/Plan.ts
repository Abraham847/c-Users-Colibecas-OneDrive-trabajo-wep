import mongoose, { Document, Schema } from 'mongoose';

export interface IPlan extends Document {
  name: string;
  type: 'shared' | 'vps' | 'dedicated' | 'cloud' | 'email' | 'ssl';
  tier: 'free' | 'starter' | 'business' | 'professional' | 'enterprise';
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  setupFee: number;
  features: Record<string, boolean | number | string>;
  resources: {
    cpu: number;
    ram: number;
    storage: number;
    bandwidth: number;
    websites: number;
    databases: number;
    emails: number;
    subdomains: number;
  };
  limits: {
    visitors: number;
    processes: number;
    inodes: number;
    concurrent: number;
  };
  included: {
    ssl: boolean;
    domain: boolean;
    cdn: boolean;
    backup: boolean;
    firewall: boolean;
    ddos: boolean;
    malware: boolean;
    monitoring: boolean;
    priority: boolean;
  };
  position: number;
  popular: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const planSchema = new Schema<IPlan>(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ['shared', 'vps', 'dedicated', 'cloud', 'email', 'ssl'], required: true },
    tier: { type: String, enum: ['free', 'starter', 'business', 'professional', 'enterprise'], required: true },
    price: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    interval: { type: String, enum: ['monthly', 'yearly'], default: 'monthly' },
    setupFee: { type: Number, default: 0 },
    features: { type: Schema.Types.Mixed, default: {} },
    resources: {
      cpu: { type: Number, default: 1 },
      ram: { type: Number, default: 1024 },
      storage: { type: Number, default: 1073741824 },
      bandwidth: { type: Number, default: 10737418240 },
      websites: { type: Number, default: 1 },
      databases: { type: Number, default: 1 },
      emails: { type: Number, default: 5 },
      subdomains: { type: Number, default: 10 },
    },
    limits: {
      visitors: { type: Number, default: 10000 },
      processes: { type: Number, default: 50 },
      inodes: { type: Number, default: 50000 },
      concurrent: { type: Number, default: 100 },
    },
    included: {
      ssl: { type: Boolean, default: true },
      domain: { type: Boolean, default: false },
      cdn: { type: Boolean, default: true },
      backup: { type: Boolean, default: true },
      firewall: { type: Boolean, default: true },
      ddos: { type: Boolean, default: true },
      malware: { type: Boolean, default: false },
      monitoring: { type: Boolean, default: true },
      priority: { type: Boolean, default: false },
    },
    position: { type: Number, default: 0 },
    popular: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Plan = mongoose.model<IPlan>('Plan', planSchema);
