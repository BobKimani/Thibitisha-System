export enum FileFormat {
  CSV = 'csv',
  JSON = 'json',
  XML = 'xml',
}

export enum ValidationMode {
  REAL_TIME = 'real-time',
  SIMULATED = 'simulated',
}

export enum AccountStatus {
  VALID = 'valid',
  INVALID = 'invalid',
  PENDING = 'pending',
}

export interface Account {
  id: string;
  accountNumber: string;
  bankCode: string;
  bankName?: string;
  holderName?: string;
  amount?: number;
  currency?: string;
  reference?: string;
  status: AccountStatus;
  reason?: string;
  timestamp: number;
}

export interface ValidationResult {
  totalRecords: number;
  validCount: number;
  invalidCount: number;
  pendingCount: number;
  errorBreakdown: {
    [key: string]: number;
  };
  accounts: Account[];
  processingTime: number;
  cacheHits: number;
}

export interface ValidationStats {
  total: number;
  valid: number;
  invalid: number;
  pending: number;
  cacheHitRate: number;
  averageResponseTime: number;
}

export interface BankAPI {
  id: string;
  name: string;
  code: string;
  status: 'online' | 'offline' | 'degraded';
  averageResponseTime: number;
  lastChecked: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'viewer';
  organization: string;
}