import mongoose, { Document, Schema } from 'mongoose';

export interface IDNSSetting extends Document {
  userId: mongoose.Types.ObjectId;
  domain: string;
  records: Array<{
    type: 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'NS' | 'SRV' | 'CAA' | 'SOA';
    name: string;
    value: string;
    ttl: number;
    priority?: number;
    weight?: number;
    port?: number;
    flags?: number;
    tag?: string;
    status: 'active' | 'pending' | 'disabled';
  }>;
  template?: string;
  defaultRecords: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const dnsSettingSchema = new Schema<IDNSSetting>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    domain: { type: String, required: true, unique: true, lowercase: true },
    records: [
      {
        type: {
          type: String,
          enum: ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'SRV', 'CAA', 'SOA'],
          required: true,
        },
        name: { type: String, required: true },
        value: { type: String, required: true },
        ttl: { type: Number, default: 3600 },
        priority: Number,
        weight: Number,
        port: Number,
        flags: Number,
        tag: String,
        status: { type: String, enum: ['active', 'pending', 'disabled'], default: 'active' },
      },
    ],
    template: String,
    defaultRecords: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const DNSSetting = mongoose.model<IDNSSetting>('DNSSetting', dnsSettingSchema);
