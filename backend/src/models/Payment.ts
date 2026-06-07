import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  userId: mongoose.Types.ObjectId;
  subscriptionId?: string;
  amount: number;
  currency: string;
  provider: 'stripe' | 'paypal';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  providerPaymentId?: string;
  providerInvoiceId?: string;
  description: string;
  planName?: string;
  interval?: 'monthly' | 'yearly';
  refundAmount?: number;
  refundReason?: string;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    subscriptionId: String,
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    provider: { type: String, enum: ['stripe', 'paypal'], required: true },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    providerPaymentId: String,
    providerInvoiceId: String,
    description: { type: String, required: true },
    planName: String,
    interval: { type: String, enum: ['monthly', 'yearly'] },
    refundAmount: Number,
    refundReason: String,
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

paymentSchema.index({ userId: 1, status: 1 });
paymentSchema.index({ providerPaymentId: 1 }, { sparse: true });

export const Payment = mongoose.model<IPayment>('Payment', paymentSchema);
