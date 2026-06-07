import mongoose, { Document, Schema } from 'mongoose';

export interface IHostingPlan extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'shared' | 'vps' | 'dedicated' | 'cloud';
  name: string;
  status: 'pending' | 'active' | 'suspended' | 'cancelled';
  subscriptionId?: string;
  resources: {
    cpu: number;
    ram: number;
    storage: number;
    bandwidth: number;
  };
  resourceUsage: {
    cpu: number;
    ram: number;
    storage: number;
    bandwidth: number;
  };
  server?: {
    ip: string;
    hostname: string;
    os: string;
    sshPort: number;
    sshKey?: string;
    username?: string;
    password?: string;
  };
  domain?: string;
  ssl: {
    enabled: boolean;
    status: 'none' | 'pending' | 'issued' | 'expired';
    certificate?: string;
    privateKey?: string;
    expiryDate?: Date;
  };
  databases: mongoose.Types.ObjectId[];
  emails: mongoose.Types.ObjectId[];
  deployments: mongoose.Types.ObjectId[];
  backups: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    retention: number;
    lastBackup?: Date;
  };
  autoScale: boolean;
  monitoring: boolean;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  nextBillingDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const hostingPlanSchema = new Schema<IHostingPlan>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['shared', 'vps', 'dedicated', 'cloud'], required: true },
    name: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'active', 'suspended', 'cancelled'],
      default: 'pending',
    },
    subscriptionId: String,
    resources: {
      cpu: { type: Number, required: true },
      ram: { type: Number, required: true },
      storage: { type: Number, required: true },
      bandwidth: { type: Number, required: true },
    },
    resourceUsage: {
      cpu: { type: Number, default: 0 },
      ram: { type: Number, default: 0 },
      storage: { type: Number, default: 0 },
      bandwidth: { type: Number, default: 0 },
    },
    server: {
      ip: String,
      hostname: String,
      os: String,
      sshPort: { type: Number, default: 22 },
      sshKey: String,
      username: String,
      password: String,
    },
    domain: String,
    ssl: {
      enabled: { type: Boolean, default: false },
      status: { type: String, enum: ['none', 'pending', 'issued', 'expired'], default: 'none' },
      certificate: String,
      privateKey: String,
      expiryDate: Date,
    },
    databases: [{ type: Schema.Types.ObjectId, ref: 'Database' }],
    emails: [{ type: Schema.Types.ObjectId, ref: 'Email' }],
    deployments: [{ type: Schema.Types.ObjectId, ref: 'Deployment' }],
    backups: {
      enabled: { type: Boolean, default: true },
      frequency: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'daily' },
      retention: { type: Number, default: 7 },
      lastBackup: Date,
    },
    autoScale: { type: Boolean, default: false },
    monitoring: { type: Boolean, default: true },
    price: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    interval: { type: String, enum: ['monthly', 'yearly'], default: 'monthly' },
    nextBillingDate: { type: Date },
  },
  { timestamps: true }
);

export const HostingPlan = mongoose.model<IHostingPlan>('HostingPlan', hostingPlanSchema);
