// =============================================
// ReceiptVault — TypeScript Interfaces
// =============================================

export type ReceiptCategory =
  | 'appliances'
  | 'electronics'
  | 'furniture'
  | 'clothing'
  | 'tools'
  | 'automotive'
  | 'sports'
  | 'home_improvement'
  | 'other';

export interface Receipt {
  id: string;
  userId: string;

  // Core info (auto-filled by OCR, editable by user)
  productName: string;
  storeName: string;
  purchaseDate: string;           // ISO date string "2024-03-15"
  amount: number;                 // in dollars
  currency: string;               // default "USD"

  // Warranty
  hasWarranty: boolean;
  warrantyMonths: number;         // 0 if no warranty
  warrantyExpiryDate: string;     // ISO date string
  warrantyNotes: string;

  // Category
  category: ReceiptCategory;

  // Files
  imageUri: string;               // Firebase Storage download URL
  thumbnailUri?: string;

  // Metadata
  createdAt: string;              // ISO timestamp
  updatedAt: string;
  notes: string;

  // Notification tracking
  notificationId30Days?: string;
  notificationId7Days?: string;
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: string;
  plan: 'free' | 'pro';
}

export interface OCRResult {
  rawText: string;
  productName?: string;
  storeName?: string;
  purchaseDate?: string;
  amount?: number;
  confidence: number;             // 0-1
}

export interface WarrantyDurationOption {
  label: string;
  months: number;
}

export const WARRANTY_DURATIONS: WarrantyDurationOption[] = [
  { label: '3 Months', months: 3 },
  { label: '6 Months', months: 6 },
  { label: '1 Year', months: 12 },
  { label: '2 Years', months: 24 },
  { label: '3 Years', months: 36 },
  { label: '5 Years', months: 60 },
];

export const RECEIPT_CATEGORIES: { value: ReceiptCategory; label: string }[] = [
  { value: 'appliances', label: 'Appliances' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'furniture', label: 'Furniture' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'tools', label: 'Tools' },
  { value: 'automotive', label: 'Automotive' },
  { value: 'sports', label: 'Sports' },
  { value: 'home_improvement', label: 'Home Improvement' },
  { value: 'other', label: 'Other' },
];
