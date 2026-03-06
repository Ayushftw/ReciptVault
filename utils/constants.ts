import { ReceiptCategory } from '../types';

// =============================================
// Design System — Color Palettes
// =============================================

export interface ColorPalette {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  warning: string;
  warningLight: string;
  danger: string;
  dangerLight: string;
  background: string;
  surface: string;
  surfaceElevated: string;
  card: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  borderLight: string;
  success: string;
  successLight: string;
  overlay: string;
  inputBg: string;
  tabBar: string;
  tabBarBorder: string;
  shimmer: string;
}

export const lightColors: ColorPalette = {
  primary: '#16a34a',
  primaryDark: '#15803d',
  primaryLight: '#bbf7d0',
  warning: '#f59e0b',
  warningLight: '#fef3c7',
  danger: '#ef4444',
  dangerLight: '#fee2e2',
  background: '#f8fafc',
  surface: '#ffffff',
  surfaceElevated: '#ffffff',
  card: '#ffffff',
  textPrimary: '#0f172a',
  textSecondary: '#64748b',
  textTertiary: '#94a3b8',
  border: '#e2e8f0',
  borderLight: '#f1f5f9',
  success: '#16a34a',
  successLight: '#dcfce7',
  overlay: 'rgba(0, 0, 0, 0.5)',
  inputBg: '#ffffff',
  tabBar: '#ffffff',
  tabBarBorder: '#f1f5f9',
  shimmer: '#e2e8f0',
};

export const darkColors: ColorPalette = {
  primary: '#22c55e',
  primaryDark: '#16a34a',
  primaryLight: '#166534',
  warning: '#fbbf24',
  warningLight: '#422006',
  danger: '#f87171',
  dangerLight: '#450a0a',
  background: '#0f172a',
  surface: '#1e293b',
  surfaceElevated: '#334155',
  card: '#1e293b',
  textPrimary: '#f1f5f9',
  textSecondary: '#94a3b8',
  textTertiary: '#64748b',
  border: '#334155',
  borderLight: '#1e293b',
  success: '#22c55e',
  successLight: '#166534',
  overlay: 'rgba(0, 0, 0, 0.7)',
  inputBg: '#1e293b',
  tabBar: '#1e293b',
  tabBarBorder: '#334155',
  shimmer: '#334155',
};

// =============================================
// Typography
// =============================================

export const FONTS = {
  regular: 'System',
  sizes: {
    xs: 11,
    sm: 13,
    base: 15,
    lg: 17,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
};

// =============================================
// Spacing & Layout
// =============================================

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
};

// =============================================
// Shadows
// =============================================

export const SHADOW = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
};

// =============================================
// Category data
// =============================================

export const CATEGORY_ICONS: Record<ReceiptCategory, string> = {
  appliances: '🏠',
  electronics: '💻',
  furniture: '🛋️',
  clothing: '👗',
  tools: '🔧',
  automotive: '🚗',
  sports: '⚽',
  home_improvement: '🔨',
  other: '📦',
};

export const CATEGORY_LABELS: Record<ReceiptCategory, string> = {
  appliances: 'Appliances',
  electronics: 'Electronics',
  furniture: 'Furniture',
  clothing: 'Clothing',
  tools: 'Tools',
  automotive: 'Automotive',
  sports: 'Sports',
  home_improvement: 'Home Improvement',
  other: 'Other',
};

export const FREE_PLAN_LIMIT = 10;
