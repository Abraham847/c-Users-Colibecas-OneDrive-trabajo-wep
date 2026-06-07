import mongoose, { Document, Schema } from 'mongoose';

export interface IDatabase extends Document {
  userId: mongoose.Types.ObjectId;
  hostingPlanId: mongoose.Types.ObjectId;
  name: string;
  type: 'mysql' | 'postgresql' | 'mongodb' | 'redis' | 'mariadb';
  status: 'creating' | 'active' | 'suspended' | 'deleting';
  username: string;
  password: string;
  host: string;
  port: number;
  engine: string;
  version: string;
  size: number;
  maxSize: number;
  connectionString?: string;
  sslEnabled: boolean;
  backups: {
    enabled: boolean;
    frequency: string;
    retention: number;
    lastBackup?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const databaseSchema = new Schema<IDatabase>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    hostingPlanId: { type: Schema.Types.ObjectId, ref: 'HostingPlan', required: true },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ['mysql', 'postgresql', 'mongodb', 'redis', 'mariadb'],
      required: true,
    },
    status: {
      type: String,
      enum: ['creating', 'active', 'suspended', 'deleting'],
      default: 'creating',
    },
    username: { type: String, required: true },
    password: { type: String, required: true, select: false },
    host: { type: String, required: true },
    port: { type: Number, required: true },
    engine: String,
    version: { type: String, default: 'latest' },
    size: { type: Number, default: 0 },
    maxSize: { type: Number, default: 1073741824 },
    connectionString: { type: String, select: false },
    sslEnabled: { type: Boolean, default: false },
    backups: {
      enabled: { type: Boolean, default: true },
      frequency: { type: String, default: 'daily' },
      retention: { type: Number, default: 7 },
      lastBackup: Date,
    },
  },
  { timestamps: true }
);

export const Database = mongoose.model<IDatabase>('Database', databaseSchema);
