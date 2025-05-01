import { create } from 'zustand';
import { 
  Account, 
  AccountStatus, 
  ValidationResult, 
  ValidationMode,
  BankAPI 
} from '../lib/types';
import { delay, getRandomInt, mockValidationAPI } from '../lib/utils';

interface ValidationState {
  // Results
  validationResult: ValidationResult | null;
  isValidating: boolean;
  progress: number;
  error: string | null;
  
  // APIs
  bankAPIs: BankAPI[];
  
  // Actions
  validateAccounts: (accounts: Omit<Account, 'status' | 'reason' | 'timestamp'>[]) => Promise<void>;
  resetValidation: () => void;
  abortValidation: () => void;
  downloadResults: (type: 'valid' | 'invalid' | 'all' | 'report') => void;
}

const mockBankAPIs: BankAPI[] = [
  {
    id: '1',
    name: 'Equity Bank',
    code: 'EQB',
    status: 'online',
    averageResponseTime: 180,
    lastChecked: Date.now(),
  },
  {
    id: '2',
    name: 'KCB Bank',
    code: 'KCB',
    status: 'online',
    averageResponseTime: 210,
    lastChecked: Date.now(),
  },
  {
    id: '3',
    name: 'Stanbic Bank',
    code: 'STB',
    status: 'degraded',
    averageResponseTime: 350,
    lastChecked: Date.now(),
  },
  {
    id: '4',
    name: 'Absa Bank',
    code: 'ABS',
    status: 'online',
    averageResponseTime: 190,
    lastChecked: Date.now(),
  },
  {
    id: '5',
    name: 'Cooperative Bank',
    code: 'COB',
    status: 'offline',
    averageResponseTime: 0,
    lastChecked: Date.now(),
  },
];

// Simple cache for demo purposes
const validationCache: Record<string, { valid: boolean; reason?: string }> = {};

const useValidationStore = create<ValidationState>((set, get) => ({
  validationResult: null,
  isValidating: false,
  progress: 0,
  error: null,
  bankAPIs: mockBankAPIs,
  
  validateAccounts: async (inputAccounts) => {
    set({ isValidating: true, progress: 0, error: null });
    
    const startTime = Date.now();
    let cacheHits = 0;
    const batchSize = 10; // Process in batches for better UI responsiveness
    const accounts: Account[] = [];
    const errorBreakdown: Record<string, number> = {};
    let aborted = false;
    
    // Convert input accounts to pending accounts
    inputAccounts.forEach(acc => {
      accounts.push({
        ...acc,
        status: AccountStatus.PENDING,
        timestamp: Date.now(),
      });
    });
    
    // Update initial state
    set({
      validationResult: {
        totalRecords: accounts.length,
        validCount: 0,
        invalidCount: 0,
        pendingCount: accounts.length,
        errorBreakdown: {},
        accounts,
        processingTime: 0,
        cacheHits: 0,
      }
    });
    
    // Process accounts in batches
    for (let i = 0; i < accounts.length; i += batchSize) {
      if (aborted) break;
      
      const batch = accounts.slice(i, i + batchSize);
      await Promise.all(batch.map(async (account) => {
        const cacheKey = `${account.bankCode}-${account.accountNumber}`;
        
        // Check cache first
        if (validationCache[cacheKey]) {
          cacheHits++;
          const result = validationCache[cacheKey];
          account.status = result.valid ? AccountStatus.VALID : AccountStatus.INVALID;
          account.reason = result.reason;
        } else {
          // Simulate API call
          await delay(getRandomInt(200, 500));
          const result = await mockValidationAPI(account.accountNumber);
          account.status = result.valid ? AccountStatus.VALID : AccountStatus.INVALID;
          account.reason = result.reason;
          
          // Add to cache
          validationCache[cacheKey] = result;
          
          // Update error breakdown
          if (!result.valid && result.reason) {
            errorBreakdown[result.reason] = (errorBreakdown[result.reason] || 0) + 1;
          }
        }
      }));
      
      // Update progress
      const progress = Math.min(100, Math.round(((i + batch.length) / accounts.length) * 100));
      set({ progress });
      
      // Small delay to avoid UI freezing
      await delay(50);
    }
    
    // Count results
    const validCount = accounts.filter(a => a.status === AccountStatus.VALID).length;
    const invalidCount = accounts.filter(a => a.status === AccountStatus.INVALID).length;
    const pendingCount = accounts.filter(a => a.status === AccountStatus.PENDING).length;
    
    // Calculate processing time
    const processingTime = Date.now() - startTime;
    
    // Update final result
    set({
      isValidating: false,
      progress: 100,
      validationResult: {
        totalRecords: accounts.length,
        validCount,
        invalidCount,
        pendingCount,
        errorBreakdown,
        accounts,
        processingTime,
        cacheHits,
      }
    });
  },
  
  resetValidation: () => {
    set({
      validationResult: null,
      isValidating: false,
      progress: 0,
      error: null,
    });
  },
  
  abortValidation: () => {
    set({ isValidating: false });
  },
  
  downloadResults: (type) => {
    const { validationResult } = get();
    if (!validationResult) return;
    
    let filename = '';
    let content = '';
    
    if (type === 'valid') {
      const validAccounts = validationResult.accounts.filter(a => a.status === AccountStatus.VALID);
      filename = 'valid_accounts.csv';
      content = 'Account Number,Bank Code,Bank Name,Holder Name,Amount,Currency,Reference\n';
      validAccounts.forEach(acc => {
        content += `${acc.accountNumber},${acc.bankCode},${acc.bankName || ''},${acc.holderName || ''},${acc.amount || ''},${acc.currency || ''},${acc.reference || ''}\n`;
      });
    } else if (type === 'invalid') {
      const invalidAccounts = validationResult.accounts.filter(a => a.status === AccountStatus.INVALID);
      filename = 'invalid_accounts.csv';
      content = 'Account Number,Bank Code,Bank Name,Holder Name,Error Reason\n';
      invalidAccounts.forEach(acc => {
        content += `${acc.accountNumber},${acc.bankCode},${acc.bankName || ''},${acc.holderName || ''},${acc.reason || 'Unknown Error'}\n`;
      });
    } else if (type === 'all') {
      filename = 'all_accounts.csv';
      content = 'Account Number,Bank Code,Bank Name,Status,Error Reason\n';
      validationResult.accounts.forEach(acc => {
        content += `${acc.accountNumber},${acc.bankCode},${acc.bankName || ''},${acc.status},${acc.reason || ''}\n`;
      });
    } else if (type === 'report') {
      filename = 'validation_report.json';
      const report = {
        summary: {
          totalRecords: validationResult.totalRecords,
          validCount: validationResult.validCount,
          invalidCount: validationResult.invalidCount,
          validPercentage: (validationResult.validCount / validationResult.totalRecords) * 100,
          processingTimeMs: validationResult.processingTime,
          cacheHits: validationResult.cacheHits,
          date: new Date().toISOString(),
        },
        errorBreakdown: validationResult.errorBreakdown,
      };
      content = JSON.stringify(report, null, 2);
    }
    
    const blob = new Blob([content], { type: type === 'report' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
}));

export default useValidationStore;