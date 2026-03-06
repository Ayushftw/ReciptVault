import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { WarrantyBadge } from './WarrantyBadge';
import { FONTS, SPACING, BORDER_RADIUS, SHADOW, CATEGORY_ICONS } from '../utils/constants';
import { formatDate, formatCurrency } from '../utils/dateHelpers';
import { Receipt } from '../types';

interface ReceiptCardProps {
  receipt: Receipt;
  onPress: () => void;
}

export function ReceiptCard({ receipt, onPress }: ReceiptCardProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.card, { backgroundColor: colors.card }, SHADOW.sm]}
    >
      {/* Left icon or thumbnail */}
      <View style={[styles.iconContainer, { backgroundColor: colors.borderLight }]}>
        {receipt.imageUri ? (
          <Image source={{ uri: receipt.imageUri }} style={styles.thumbnail} />
        ) : (
          <Text style={styles.categoryIcon}>
            {CATEGORY_ICONS[receipt.category] || '📦'}
          </Text>
        )}
      </View>

      {/* Main content */}
      <View style={styles.content}>
        <Text style={[styles.productName, { color: colors.textPrimary }]} numberOfLines={1}>
          {receipt.productName}
        </Text>
        <Text style={[styles.storeName, { color: colors.textSecondary }]} numberOfLines={1}>
          {receipt.storeName}
        </Text>
        <View style={styles.metaRow}>
          <Text style={[styles.dateText, { color: colors.textTertiary }]}>
            {formatDate(receipt.purchaseDate)}
          </Text>
          {receipt.hasWarranty && (
            <WarrantyBadge hasWarranty={receipt.hasWarranty} expiryDate={receipt.warrantyExpiryDate} />
          )}
        </View>
      </View>

      {/* Amount */}
      <View style={styles.amountContainer}>
        <Text style={[styles.amount, { color: colors.textPrimary }]}>
          {formatCurrency(receipt.amount)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.base,
    marginBottom: SPACING.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  thumbnail: { width: 48, height: 48 },
  categoryIcon: { fontSize: 22 },
  content: { flex: 1, marginLeft: SPACING.md },
  productName: { fontSize: FONTS.sizes.base, fontWeight: '600' },
  storeName: { fontSize: FONTS.sizes.xs, marginTop: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: SPACING.xs, gap: SPACING.sm },
  dateText: { fontSize: FONTS.sizes.xs },
  amountContainer: { marginLeft: SPACING.md },
  amount: { fontSize: FONTS.sizes.base, fontWeight: '700' },
});
