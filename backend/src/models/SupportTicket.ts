import mongoose, { Document, Schema } from 'mongoose';

export interface ISupportTicket extends Document {
  userId: mongoose.Types.ObjectId;
  subject: string;
  category: 'technical' | 'billing' | 'domain' | 'hosting' | 'security' | 'other';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'open' | 'waiting' | 'in_progress' | 'resolved' | 'closed';
  messages: Array<{
    sender: mongoose.Types.ObjectId;
    senderRole: 'user' | 'admin' | 'ai';
    message: string;
    attachments?: string[];
    createdAt: Date;
  }>;
  assignedTo?: mongoose.Types.ObjectId;
  relatedDomain?: string;
  relatedHosting?: mongoose.Types.ObjectId;
  rating?: number;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const supportTicketSchema = new Schema<ISupportTicket>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true },
    category: {
      type: String,
      enum: ['technical', 'billing', 'domain', 'hosting', 'security', 'other'],
      required: true,
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal',
    },
    status: {
      type: String,
      enum: ['open', 'waiting', 'in_progress', 'resolved', 'closed'],
      default: 'open',
    },
    messages: [
      {
        sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        senderRole: { type: String, enum: ['user', 'admin', 'ai'], required: true },
        message: { type: String, required: true },
        attachments: [String],
        createdAt: { type: Date, default: Date.now },
      },
    ],
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    relatedDomain: String,
    relatedHosting: { type: Schema.Types.ObjectId, ref: 'HostingPlan' },
    rating: { type: Number, min: 1, max: 5 },
    resolvedAt: Date,
  },
  { timestamps: true }
);

export const SupportTicket = mongoose.model<ISupportTicket>('SupportTicket', supportTicketSchema);
