import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { daysUntilExpiry, getWarrantyStatus } from '../utils/dateHelpers';
import { FONTS, SPACING, BORDER_RADIUS } from '../utils/constants';

interface WarrantyBadgeProps {
  hasWarranty: boolean;
  expiryDate: string;
}

export function WarrantyBadge({ hasWarranty, expiryDate }: WarrantyBadgeProps) {
  const { colors } = useTheme();

  if (!hasWarranty) return null;

  const status = getWarrantyStatus(hasWarranty, expiryDate);
  const days = daysUntilExpiry(expiryDate);

  const config: Record<string, { bg: string; text: string; label: string }> = {
    good: { bg: colors.successLight, text: colors.success, label: `${days}d left` },
    warning: { bg: colors.warningLight, text: colors.warning, label: `${days}d left` },
    critical: { bg: colors.dangerLight, text: colors.danger, label: `${days}d left` },
    expired: { bg: colors.dangerLight, text: colors.danger, label: 'Expired' },
    none: { bg: colors.borderLight, text: colors.textTertiary, label: 'N/A' },
  };

  const c = config[status] || config.none;

  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.text, { color: c.text }]}>{c.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },
  text: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '700',
  },
});
