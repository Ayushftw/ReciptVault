import {
  format,
  parseISO,
  addMonths,
  differenceInDays,
  isAfter,
  isBefore,
  isValid,
} from 'date-fns';

/**
 * Format an ISO date string to a human-readable format
 * e.g. "Mar 15, 2024"
 */
export function formatDate(isoDate: string): string {
  try {
    const date = parseISO(isoDate);
    if (!isValid(date)) return 'Invalid date';
    return format(date, 'MMM d, yyyy');
  } catch {
    return 'Invalid date';
  }
}

/**
 * Format an ISO date string to short format
 * e.g. "3/15/24"
 */
export function formatDateShort(isoDate: string): string {
  try {
    const date = parseISO(isoDate);
    if (!isValid(date)) return '--';
    return format(date, 'M/d/yy');
  } catch {
    return '--';
  }
}

/**
 * Get today's date as an ISO string (YYYY-MM-DD)
 */
export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/**
 * Calculate warranty expiry date from purchase date + warranty months
 */
export function calculateExpiryDate(purchaseDate: string, warrantyMonths: number): string {
  try {
    const date = parseISO(purchaseDate);
    if (!isValid(date)) return '';
    return format(addMonths(date, warrantyMonths), 'yyyy-MM-dd');
  } catch {
    return '';
  }
}

/**
 * Get days remaining until warranty expiry.
 * Returns negative number if expired.
 */
export function daysUntilExpiry(expiryDate: string): number {
  try {
    const expiry = parseISO(expiryDate);
    if (!isValid(expiry)) return 0;
    return differenceInDays(expiry, new Date());
  } catch {
    return 0;
  }
}

/**
 * Determine warranty status for color coding
 */
export type WarrantyStatus = 'none' | 'expired' | 'critical' | 'warning' | 'good';

export function getWarrantyStatus(
  hasWarranty: boolean,
  expiryDate: string
): WarrantyStatus {
  if (!hasWarranty) return 'none';

  const days = daysUntilExpiry(expiryDate);

  if (days < 0) return 'expired';
  if (days <= 30) return 'critical';
  if (days <= 90) return 'warning';
  return 'good';
}

/**
 * Check if a warranty is expiring within the next N days
 */
export function isExpiringSoon(expiryDate: string, withinDays: number = 30): boolean {
  const days = daysUntilExpiry(expiryDate);
  return days >= 0 && days <= withinDays;
}

/**
 * Check if a warranty has expired
 */
export function isExpired(expiryDate: string): boolean {
  try {
    const expiry = parseISO(expiryDate);
    return isBefore(expiry, new Date());
  } catch {
    return false;
  }
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Get a friendly relative time string for warranty expiry
 */
export function getExpiryText(expiryDate: string): string {
  const days = daysUntilExpiry(expiryDate);

  if (days < 0) return `Expired ${Math.abs(days)} days ago`;
  if (days === 0) return 'Expires today';
  if (days === 1) return 'Expires tomorrow';
  if (days < 30) return `Expires in ${days} days`;
  if (days < 90) return `Expires in ${Math.floor(days / 30)} months`;
  return `Valid until ${formatDate(expiryDate)}`;
}
