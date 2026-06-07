export interface User {
  _id: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'superadmin';
  plan: string;
  planStatus: 'active' | 'canceled' | 'past_due' | 'trialing';
  avatar?: string;
  emailVerified: boolean;
  preferences: { language: string; theme: 'light' | 'dark' | 'system'; notifications: boolean };
  storage: { used: number; total: number };
  createdAt: string;
}

export interface Domain {
  _id: string;
  domain: string;
  tld: string;
  status: 'pending' | 'active' | 'expired' | 'cancelled';
  price: number;
  expiryDate: string;
  autoRenew: boolean;
  nameservers: string[];
  privacy: boolean;
  ssl: { enabled: boolean; status: string };
}

export interface HostingPlan {
  _id: string;
  type: 'shared' | 'vps' | 'dedicated' | 'cloud';
  name: string;
  status: 'pending' | 'active' | 'suspended' | 'cancelled';
  resources: { cpu: number; ram: number; storage: number; bandwidth: number };
  resourceUsage: { cpu: number; ram: number; storage: number; bandwidth: number };
  server?: { ip: string; hostname: string; os: string };
  price: number;
  interval: 'monthly' | 'yearly';
  nextBillingDate: string;
  ssl: { enabled: boolean; status: string };
}

export interface Payment {
  _id: string;
  amount: number;
  currency: string;
  provider: 'stripe' | 'paypal';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  description: string;
  createdAt: string;
}

export interface DNSRecord {
  _id: string;
  type: 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'NS';
  name: string;
  value: string;
  ttl: number;
  priority?: number;
  status: 'active' | 'pending' | 'disabled';
}

export interface SupportTicket {
  _id: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  messages: Array<{ sender: string; senderRole: string; message: string; createdAt: string }>;
  createdAt: string;
}

export interface Deployment {
  _id: string;
  name: string;
  repository?: string;
  branch: string;
  status: 'pending' | 'building' | 'deploying' | 'success' | 'failed';
  url?: string;
  createdAt: string;
}

export interface Plan {
  _id: string;
  name: string;
  type: string;
  tier: string;
  price: number;
  currency: string;
  interval: string;
  features: Record<string, any>;
  resources: Record<string, any>;
  popular: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: { page: number; limit: number; total: number; pages: number };
}
