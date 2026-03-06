import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { FAB } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../../store/useAppStore';
import { useReceipts } from '../../hooks/useReceipts';
import { useTheme } from '../../hooks/useTheme';
import { ReceiptCard } from '../../components/ReceiptCard';
import { EmptyState } from '../../components/EmptyState';
import { FONTS, SPACING, BORDER_RADIUS, SHADOW } from '../../utils/constants';
import { isExpiringSoon, formatCurrency, daysUntilExpiry } from '../../utils/dateHelpers';
import { format } from 'date-fns';

export default function HomeScreen() {
  const router = useRouter();
  const { currentUser, receipts } = useAppStore();
  const { refreshing, onRefresh } = useReceipts();
  const { colors } = useTheme();

  const firstName = currentUser?.displayName?.split(' ')[0] || 'there';
  const todayFormatted = format(new Date(), 'EEEE, MMMM d');

  const stats = useMemo(() => {
    const totalReceipts = receipts.length;
    const expiringSoon = receipts.filter(
      (r) => r.hasWarranty && isExpiringSoon(r.warrantyExpiryDate, 30)
    ).length;
    const activeWarranties = receipts.filter(
      (r) => r.hasWarranty && daysUntilExpiry(r.warrantyExpiryDate) >= 0
    ).length;
    const totalValue = receipts.reduce((sum, r) => sum + (r.amount || 0), 0);
    return { totalReceipts, expiringSoon, activeWarranties, totalValue };
  }, [receipts]);

  const expiringSoonReceipts = useMemo(
    () =>
      receipts
        .filter((r) => r.hasWarranty && isExpiringSoon(r.warrantyExpiryDate, 30))
        .sort((a, b) => daysUntilExpiry(a.warrantyExpiryDate) - daysUntilExpiry(b.warrantyExpiryDate)),
    [receipts]
  );

  const recentReceipts = useMemo(
    () =>
      [...receipts]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5),
    [receipts]
  );

  const statCards = [
    { emoji: '📦', label: 'Total', value: stats.totalReceipts.toString(), bg: colors.primaryLight },
    { emoji: '⚠️', label: 'Expiring', value: stats.expiringSoon.toString(), bg: colors.warningLight },
    { emoji: '✅', label: 'Active', value: stats.activeWarranties.toString(), bg: colors.successLight },
    { emoji: '💸', label: 'Value', value: formatCurrency(stats.totalValue), bg: colors.primaryLight },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: colors.textPrimary }]}>Hi, {firstName} 👋</Text>
          <Text style={[styles.dateText, { color: colors.textSecondary }]}>{todayFormatted}</Text>
        </View>

        {/* Stats */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsRow}>
          {statCards.map((card) => (
            <View key={card.label} style={[styles.statCard, { backgroundColor: card.bg }]}>
              <Text style={styles.statEmoji}>{card.emoji}</Text>
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>{card.value}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{card.label}</Text>
            </View>
          ))}
        </ScrollView>

        {receipts.length === 0 ? (
          <EmptyState
            title="Snap your first receipt!"
            message="Tap the + button to add a receipt and start tracking your warranties."
            emoji="📸"
          />
        ) : (
          <>
            {expiringSoonReceipts.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>⚠️ Expiring Soon</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                  {expiringSoonReceipts.map((receipt) => (
                    <TouchableOpacity
                      key={receipt.id}
                      style={[styles.expiringCard, { backgroundColor: colors.card, borderLeftColor: colors.warning }, SHADOW.sm]}
                      onPress={() => router.push(`/receipt/${receipt.id}`)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.expiringName, { color: colors.textPrimary }]} numberOfLines={1}>
                        {receipt.productName}
                      </Text>
                      <Text style={[styles.expiringStore, { color: colors.textSecondary }]} numberOfLines={1}>
                        {receipt.storeName}
                      </Text>
                      <View style={[styles.expiringBadge, { backgroundColor: colors.warningLight }]}>
                        <Text style={[styles.expiringDays, { color: colors.warning }]}>
                          {daysUntilExpiry(receipt.warrantyExpiryDate)}d left
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Recent Receipts</Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/receipts')}>
                  <Text style={[styles.seeAll, { color: colors.primary }]}>See All →</Text>
                </TouchableOpacity>
              </View>
              {recentReceipts.map((receipt) => (
                <ReceiptCard
                  key={receipt.id}
                  receipt={receipt}
                  onPress={() => router.push(`/receipt/${receipt.id}`)}
                />
              ))}
            </View>
          </>
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: colors.primary }]}
        color="#fff"
        onPress={() => router.push('/receipt/add')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  header: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.base, paddingBottom: SPACING.md },
  greeting: { fontSize: FONTS.sizes['2xl'], fontWeight: '800' },
  dateText: { fontSize: FONTS.sizes.sm, marginTop: SPACING.xs },
  statsRow: { paddingHorizontal: SPACING.xl, paddingBottom: SPACING.lg, gap: SPACING.md },
  statCard: {
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.base,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    minWidth: 110,
  },
  statEmoji: { fontSize: 24, marginBottom: SPACING.xs },
  statValue: { fontSize: FONTS.sizes.lg, fontWeight: '800' },
  statLabel: { fontSize: FONTS.sizes.xs, marginTop: 2 },
  section: { paddingHorizontal: SPACING.xl, marginTop: SPACING.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  sectionTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', marginBottom: SPACING.md },
  seeAll: { fontSize: FONTS.sizes.sm, fontWeight: '600', marginBottom: SPACING.md },
  horizontalList: { gap: SPACING.md, paddingRight: SPACING.xl },
  expiringCard: {
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.base,
    width: 160,
    borderLeftWidth: 3,
  },
  expiringName: { fontSize: FONTS.sizes.base, fontWeight: '700' },
  expiringStore: { fontSize: FONTS.sizes.xs, marginTop: 2 },
  expiringBadge: {
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    marginTop: SPACING.sm,
    alignSelf: 'flex-start',
  },
  expiringDays: { fontSize: FONTS.sizes.xs, fontWeight: '700' },
  fab: {
    position: 'absolute',
    right: SPACING.xl,
    bottom: SPACING.xl,
    borderRadius: BORDER_RADIUS.full,
  },
});
