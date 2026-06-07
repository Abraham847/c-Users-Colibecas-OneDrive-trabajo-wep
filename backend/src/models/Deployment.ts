import mongoose, { Document, Schema } from 'mongoose';

export interface IDeployment extends Document {
  userId: mongoose.Types.ObjectId;
  hostingPlanId: mongoose.Types.ObjectId;
  name: string;
  repository?: string;
  branch: string;
  buildCommand?: string;
  outputDir?: string;
  status: 'pending' | 'building' | 'deploying' | 'success' | 'failed' | 'cancelled';
  environment: Record<string, string>;
  domain?: string;
  ssl: boolean;
  url?: string;
  buildLog?: string;
  commitSha?: string;
  commitMessage?: string;
  deployedBy: string;
  autoDeploy: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const deploymentSchema = new Schema<IDeployment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    hostingPlanId: { type: Schema.Types.ObjectId, ref: 'HostingPlan', required: true },
    name: { type: String, required: true },
    repository: String,
    branch: { type: String, default: 'main' },
    buildCommand: { type: String, default: 'npm run build' },
    outputDir: { type: String, default: 'dist' },
    status: {
      type: String,
      enum: ['pending', 'building', 'deploying', 'success', 'failed', 'cancelled'],
      default: 'pending',
    },
    environment: { type: Schema.Types.Mixed, default: {} },
    domain: String,
    ssl: { type: Boolean, default: true },
    url: String,
    buildLog: String,
    commitSha: String,
    commitMessage: String,
    deployedBy: { type: String, default: 'manual' },
    autoDeploy: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Deployment = mongoose.model<IDeployment>('Deployment', deploymentSchema);
