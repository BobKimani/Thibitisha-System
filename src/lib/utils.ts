import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(number: number): string {
  return new Intl.NumberFormat().format(number);
}

export function formatPercentage(value: number, total: number): string {
  if (total === 0) return '0%';
  return `${Math.round((value / total) * 100)}%`;
}

export function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function mockValidationAPI(accountNumber: string): Promise<{ valid: boolean; reason?: string }> {
  // Simulate API delay
  return new Promise((resolve) => {
    setTimeout(() => {
      // Generate pseudo-random validation result for demo purposes
      const isValid = accountNumber.length === 12 && Math.random() > 0.3;
      
      if (isValid) {
        resolve({ valid: true });
      } else {
        const reasons = [
          'INVALID_FORMAT',
          'ACCOUNT_CLOSED',
          'ACCOUNT_DORMANT',
          'NOT_FOUND',
          'BANK_NOT_AVAILABLE'
        ];
        const reasonIndex = Math.floor(Math.random() * reasons.length);
        resolve({ valid: false, reason: reasons[reasonIndex] });
      }
    }, getRandomInt(100, 500));
  });
}