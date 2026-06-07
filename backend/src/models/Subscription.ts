import mongoose, { Document, Schema } from 'mongoose';

export interface ISubscription extends Document {
  userId: mongoose.Types.ObjectId;
  planId: string;
  planType: 'hosting' | 'domain' | 'email' | 'ssl' | 'addon';
  provider: 'stripe' | 'paypal' | 'system';
  providerSubscriptionId?: string;
  status: 'active' | 'canceled' | 'past_due' | 'incomplete' | 'trialing' | 'expired';
  quantity: number;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly' | 'once';
  trialEnd?: Date;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  canceledAt?: Date;
  endedAt?: Date;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    planId: { type: String, required: true },
    planType: {
      type: String,
      enum: ['hosting', 'domain', 'email', 'ssl', 'addon'],
      required: true,
    },
    provider: {
      type: String,
      enum: ['stripe', 'paypal', 'system'],
      required: true,
    },
    providerSubscriptionId: String,
    status: {
      type: String,
      enum: ['active', 'canceled', 'past_due', 'incomplete', 'trialing', 'expired'],
      default: 'trialing',
    },
    quantity: { type: Number, default: 1 },
    price: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    interval: {
      type: String,
      enum: ['monthly', 'yearly', 'once'],
      default: 'monthly',
    },
    trialEnd: Date,
    currentPeriodStart: { type: Date, required: true },
    currentPeriodEnd: { type: Date, required: true },
    canceledAt: Date,
    endedAt: Date,
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export const Subscription = mongoose.model<ISubscription>('Subscription', subscriptionSchema);
