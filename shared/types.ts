// Shared types for both frontend and backend
export type PlanType = 'shared' | 'vps' | 'dedicated' | 'cloud' | 'email' | 'ssl';
export type PlanTier = 'starter' | 'business' | 'professional' | 'enterprise';
export type UserRole = 'user' | 'admin' | 'superadmin';
export type PaymentProvider = 'stripe' | 'paypal';
export type DNSRecordType = 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'NS' | 'SRV' | 'CAA' | 'SOA';

export interface ApiError {
  success: false;
  error: string;
  code?: string;
  details?: Array<{ field: string; message: string }>;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sort?: string;
  search?: string;
}

export interface ResourceLimits {
  cpu: number;
  ram: number;
  storage: number;
  bandwidth: number;
}
