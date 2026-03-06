import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Share } from 'react-native';
import { Button, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { useAppStore, ThemeMode } from '../../store/useAppStore';
import { FONTS, SPACING, BORDER_RADIUS, SHADOW, FREE_PLAN_LIMIT } from '../../utils/constants';
import { formatCurrency } from '../../utils/dateHelpers';

const THEME_OPTIONS: { mode: ThemeMode; label: string; emoji: string }[] = [
  { mode: 'light', label: 'Light', emoji: '☀️' },
  { mode: 'dark', label: 'Dark', emoji: '🌙' },
  { mode: 'system', label: 'System', emoji: '📱' },
];

export default function ProfileScreen() {
  const { signOut, loading } = useAuth();
  const { colors, themeMode, setThemeMode } = useTheme();
  const { currentUser, receipts } = useAppStore();

  const totalValue = useMemo(() => receipts.reduce((sum, r) => sum + (r.amount || 0), 0), [receipts]);
  const initial = currentUser?.displayName?.charAt(0)?.toUpperCase() || '?';

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  const handleExport = async () => {
    try {
      const header = 'Product,Store,Purchase Date,Amount,Category,Warranty Months,Warranty Expiry,Notes\n';
      const rows = receipts.map((r) =>
        `"${r.productName}","${r.storeName}","${r.purchaseDate}","${r.amount}","${r.category}","${r.warrantyMonths}","${r.warrantyExpiryDate}","${r.notes}"`
      ).join('\n');
      await Share.share({ message: header + rows, title: 'ReceiptVault Export' });
    } catch { Alert.alert('Error', 'Failed to export.'); }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={[styles.screenTitle, { color: colors.textPrimary }]}>Profile</Text>

        {/* Avatar Card */}
        <View style={[styles.profileCard, { backgroundColor: colors.card }, SHADOW.md]}>
          <View style={[styles.avatar, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.avatarText, { color: colors.primary }]}>{initial}</Text>
          </View>
          <Text style={[styles.displayName, { color: colors.textPrimary }]}>{currentUser?.displayName}</Text>
          <Text style={[styles.email, { color: colors.textSecondary }]}>{currentUser?.email}</Text>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{receipts.length}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Receipts</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{formatCurrency(totalValue)}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Value</Text>
            </View>
          </View>
        </View>

        {/* Plan */}
        <View style={[styles.planBanner, { backgroundColor: colors.card, borderLeftColor: colors.primary }, SHADOW.sm]}>
          {currentUser?.plan === 'pro' ? (
            <Text style={[styles.planText, { color: colors.textPrimary }]}>✅ Pro Plan — Unlimited</Text>
          ) : (
            <>
              <Text style={[styles.planText, { color: colors.textPrimary }]}>
                📦 {receipts.length}/{FREE_PLAN_LIMIT} free receipts
              </Text>
              <TouchableOpacity onPress={() => Alert.alert('Coming Soon! 🚀', 'Pro plan $3.99/mo')}>
                <Text style={[styles.upgradeLink, { color: colors.primary }]}>Upgrade to Pro →</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Theme Selector */}
        <View style={[styles.settingsCard, { backgroundColor: colors.card }, SHADOW.sm]}>
          <Text style={[styles.settingsTitle, { color: colors.textPrimary }]}>Appearance</Text>
          <View style={styles.themeRow}>
            {THEME_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.mode}
                style={[
                  styles.themeOption,
                  {
                    backgroundColor: themeMode === opt.mode ? colors.primary : colors.surfaceElevated,
                    borderColor: themeMode === opt.mode ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setThemeMode(opt.mode)}
                activeOpacity={0.7}
              >
                <Text style={styles.themeEmoji}>{opt.emoji}</Text>
                <Text style={[styles.themeLabel, { color: themeMode === opt.mode ? '#fff' : colors.textSecondary }]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Settings */}
        <View style={[styles.settingsCard, { backgroundColor: colors.card }, SHADOW.sm]}>
          <Text style={[styles.settingsTitle, { color: colors.textPrimary }]}>Settings</Text>
          {[
            { emoji: '📤', text: 'Export All Data (CSV)', onPress: handleExport },
            { emoji: '⭐', text: 'Rate the App', onPress: () => Alert.alert('Thanks! ⭐') },
            { emoji: '🔒', text: 'Privacy Policy', onPress: () => Alert.alert('Privacy Policy', 'URL here') },
          ].map((item, i) => (
            <React.Fragment key={item.text}>
              {i > 0 && <Divider style={{ backgroundColor: colors.borderLight }} />}
              <TouchableOpacity style={styles.settingsRow} onPress={item.onPress}>
                <Text style={styles.settingsRowEmoji}>{item.emoji}</Text>
                <Text style={[styles.settingsRowText, { color: colors.textPrimary }]}>{item.text}</Text>
                <Text style={[styles.settingsRowArrow, { color: colors.textTertiary }]}>›</Text>
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </View>

        <Button
          mode="outlined"
          onPress={handleSignOut}
          loading={loading}
          style={[styles.signOutButton, { borderColor: colors.danger }]}
          labelStyle={styles.signOutLabel}
          textColor={colors.danger}
        >
          Sign Out
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: SPACING.xl, paddingBottom: SPACING['3xl'] },
  screenTitle: { fontSize: FONTS.sizes['2xl'], fontWeight: '800', paddingTop: SPACING.base, paddingBottom: SPACING.lg },
  profileCard: { borderRadius: BORDER_RADIUS.xl, padding: SPACING.xl, alignItems: 'center' },
  avatar: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.md },
  avatarText: { fontSize: FONTS.sizes['3xl'], fontWeight: '700' },
  displayName: { fontSize: FONTS.sizes.xl, fontWeight: '700' },
  email: { fontSize: FONTS.sizes.sm, marginTop: SPACING.xs },
  statsRow: { flexDirection: 'row', marginTop: SPACING.lg, alignItems: 'center' },
  stat: { alignItems: 'center', paddingHorizontal: SPACING.xl },
  statValue: { fontSize: FONTS.sizes.xl, fontWeight: '800' },
  statLabel: { fontSize: FONTS.sizes.xs, marginTop: SPACING.xs },
  statDivider: { width: 1, height: 32 },
  planBanner: { borderRadius: BORDER_RADIUS.md, padding: SPACING.base, marginTop: SPACING.base, borderLeftWidth: 3 },
  planText: { fontSize: FONTS.sizes.sm, fontWeight: '600' },
  upgradeLink: { fontSize: FONTS.sizes.sm, fontWeight: '700', marginTop: SPACING.xs },
  settingsCard: { borderRadius: BORDER_RADIUS.xl, padding: SPACING.base, marginTop: SPACING.base },
  settingsTitle: { fontSize: FONTS.sizes.base, fontWeight: '700', marginBottom: SPACING.md, paddingHorizontal: SPACING.sm },
  themeRow: { flexDirection: 'row', gap: SPACING.sm, paddingHorizontal: SPACING.sm },
  themeOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
  },
  themeEmoji: { fontSize: 20, marginBottom: 4 },
  themeLabel: { fontSize: FONTS.sizes.xs, fontWeight: '600' },
  settingsRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.md, paddingHorizontal: SPACING.sm },
  settingsRowEmoji: { fontSize: 18, marginRight: SPACING.md },
  settingsRowText: { flex: 1, fontSize: FONTS.sizes.base },
  settingsRowArrow: { fontSize: FONTS.sizes.xl },
  signOutButton: { marginTop: SPACING.xl, borderRadius: BORDER_RADIUS.md },
  signOutLabel: { fontSize: FONTS.sizes.base, fontWeight: '600' },
});
