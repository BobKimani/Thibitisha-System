export enum AccountStatus {
  VALID = "VALID",
  INVALID = "INVALID",
  PENDING = "PENDING",
}

export enum ValidationMode {
  REAL_TIME = "REAL_TIME",
  SIMULATED = "SIMULATED",
}

export interface Account {
  accountNumber: string
  bankCode: string
  accountName?: string
  bankName?: string
  status: AccountStatus | string
  reason?: string
  timestamp: string
  currency?: string
}

export interface ValidationResult {
  totalRecords: number
  validCount: number
  invalidCount: number
  accounts: Account[]
  timestamp: string
  duration: number
}
