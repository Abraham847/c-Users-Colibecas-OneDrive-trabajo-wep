import { Request } from 'express';

export interface UserPayload {
  id: string;
  email: string;
  role: 'user' | 'admin' | 'superadmin';
  plan?: string;
}

export interface AuthRequest extends Request {
  user?: UserPayload;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export type DomainStatus = 'available' | 'registered' | 'pending' | 'active' | 'expired' | 'cancelled';
export type HostingType = 'shared' | 'vps' | 'dedicated' | 'cloud';
export type HostingStatus = 'pending' | 'active' | 'suspended' | 'cancelled';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'incomplete' | 'trialing';
export type SSLStatus = 'pending' | 'issued' | 'expired' | 'failed';
export type DeploymentStatus = 'pending' | 'building' | 'deploying' | 'success' | 'failed';

export interface PlanFeature {
  name: string;
  included: boolean;
  limit?: number;
}

export interface Plan {
  id: string;
  name: string;
  type: HostingType;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  features: PlanFeature[];
  resources: {
    cpu: number;
    ram: number;
    storage: number;
    bandwidth: number;
    websites: number;
    databases: number;
    emails: number;
  };
}

export interface DomainInfo {
  domain: string;
  available: boolean;
  price: number;
  currency: string;
  period: number;
  tld: string;
}

export interface DNSRecord {
  id: string;
  type: 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'NS' | 'SRV' | 'CAA';
  name: string;
  value: string;
  ttl: number;
  priority?: number;
}

export interface DeploymentConfig {
  repository?: string;
  branch?: string;
  buildCommand?: string;
  outputDir?: string;
  environment?: Record<string, string>;
}
