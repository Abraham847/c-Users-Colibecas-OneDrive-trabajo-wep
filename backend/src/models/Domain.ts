import mongoose, { Document, Schema } from 'mongoose';

export interface IDomain extends Document {
  userId: mongoose.Types.ObjectId;
  domain: string;
  tld: string;
  status: 'pending' | 'active' | 'expired' | 'cancelled' | 'transferring';
  price: number;
  currency: string;
  registrationDate: Date;
  expiryDate: Date;
  autoRenew: boolean;
  nameservers: string[];
  privacy: boolean;
  dnssec: boolean;
  locks: {
    transferLock: boolean;
    deleteLock: boolean;
  };
  contacts: {
    registrant: { name: string; email: string; organization?: string };
    admin: { name: string; email: string };
    tech: { name: string; email: string };
  };
  ssl: {
    enabled: boolean;
    status: 'none' | 'pending' | 'issued' | 'expired';
    certificate?: string;
    issuer?: string;
    expiryDate?: Date;
  };
  hostingPlan?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const domainSchema = new Schema<IDomain>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    domain: { type: String, required: true, unique: true, lowercase: true },
    tld: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'active', 'expired', 'cancelled', 'transferring'],
      default: 'pending',
    },
    price: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
    registrationDate: { type: Date },
    expiryDate: { type: Date },
    autoRenew: { type: Boolean, default: false },
    nameservers: [String],
    privacy: { type: Boolean, default: true },
    dnssec: { type: Boolean, default: false },
    locks: {
      transferLock: { type: Boolean, default: true },
      deleteLock: { type: Boolean, default: true },
    },
    contacts: {
      registrant: {
        name: { type: String },
        email: { type: String },
        organization: String,
      },
      admin: { name: String, email: String },
      tech: { name: String, email: String },
    },
    ssl: {
      enabled: { type: Boolean, default: false },
      status: { type: String, enum: ['none', 'pending', 'issued', 'expired'], default: 'none' },
      certificate: String,
      issuer: String,
      expiryDate: Date,
    },
    hostingPlan: { type: Schema.Types.ObjectId, ref: 'HostingPlan' },
  },
  { timestamps: true }
);

domainSchema.index({ userId: 1, status: 1 });
domainSchema.index({ domain: 'text' });

export const Domain = mongoose.model<IDomain>('Domain', domainSchema);
