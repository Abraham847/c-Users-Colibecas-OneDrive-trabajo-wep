import mongoose, { Document, Schema } from 'mongoose';

export interface IWebsite extends Document {
  userId: mongoose.Types.ObjectId;
  hostingPlanId: mongoose.Types.ObjectId;
  name: string;
  domain: string;
  type: 'html' | 'wordpress' | 'react' | 'nextjs' | 'nodejs' | 'python' | 'static';
  framework?: string;
  status: 'creating' | 'active' | 'suspended' | 'deleted';
  source: 'builder' | 'import' | 'github' | 'ai' | 'template';
  template?: string;
  aiPrompt?: string;
  pages: number;
  storage: number;
  analytics?: {
    visitors: number;
    bandwidth: number;
    lastMonth: number;
  };
  seo: {
    title?: string;
    description?: string;
    keywords?: string[];
    robotsTxt: boolean;
    sitemap: boolean;
  };
  performance: {
    optimization: 'none' | 'basic' | 'advanced';
    cache: boolean;
    cdn: boolean;
    minify: boolean;
    compression: boolean;
  };
  security: {
    firewall: boolean;
    ddos: boolean;
    malware: boolean;
    lastScan?: Date;
  };
  backup: {
    enabled: boolean;
    frequency: string;
    lastBackup?: Date;
  };
  collaborators: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const websiteSchema = new Schema<IWebsite>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    hostingPlanId: { type: Schema.Types.ObjectId, ref: 'HostingPlan', required: true },
    name: { type: String, required: true },
    domain: { type: String },
    type: {
      type: String,
      enum: ['html', 'wordpress', 'react', 'nextjs', 'nodejs', 'python', 'static'],
      default: 'html',
    },
    framework: String,
    status: {
      type: String,
      enum: ['creating', 'active', 'suspended', 'deleted'],
      default: 'creating',
    },
    source: {
      type: String,
      enum: ['builder', 'import', 'github', 'ai', 'template'],
      default: 'builder',
    },
    template: String,
    aiPrompt: String,
    pages: { type: Number, default: 1 },
    storage: { type: Number, default: 0 },
    analytics: {
      visitors: { type: Number, default: 0 },
      bandwidth: { type: Number, default: 0 },
      lastMonth: { type: Number, default: 0 },
    },
    seo: {
      title: String,
      description: String,
      keywords: [String],
      robotsTxt: { type: Boolean, default: true },
      sitemap: { type: Boolean, default: true },
    },
    performance: {
      optimization: { type: String, enum: ['none', 'basic', 'advanced'], default: 'basic' },
      cache: { type: Boolean, default: true },
      cdn: { type: Boolean, default: true },
      minify: { type: Boolean, default: true },
      compression: { type: Boolean, default: true },
    },
    security: {
      firewall: { type: Boolean, default: true },
      ddos: { type: Boolean, default: true },
      malware: { type: Boolean, default: true },
      lastScan: Date,
    },
    backup: {
      enabled: { type: Boolean, default: true },
      frequency: { type: String, default: 'daily' },
      lastBackup: Date,
    },
    collaborators: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

export const Website = mongoose.model<IWebsite>('Website', websiteSchema);
