import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Searchbar, FAB, Menu } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../../store/useAppStore';
import { useReceipts } from '../../hooks/useReceipts';
import { useTheme } from '../../hooks/useTheme';
import { ReceiptCard } from '../../components/ReceiptCard';
import { EmptyState } from '../../components/EmptyState';
import { FONTS, SPACING, BORDER_RADIUS, CATEGORY_ICONS, CATEGORY_LABELS } from '../../utils/constants';
import { ReceiptCategory } from '../../types';
import { daysUntilExpiry } from '../../utils/dateHelpers';

type SortOption = 'date' | 'amount' | 'expiry';
const FILTER_CATEGORIES: (ReceiptCategory | 'all')[] = [
  'all', 'appliances', 'electronics', 'furniture', 'tools',
  'clothing', 'automotive', 'sports', 'home_improvement', 'other',
];

export default function ReceiptsScreen() {
  const router = useRouter();
  const { receipts } = useAppStore();
  const { colors } = useTheme();
  useReceipts();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ReceiptCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [sortMenuVisible, setSortMenuVisible] = useState(false);

  const filteredReceipts = useMemo(() => {
    let list = [...receipts];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((r) => r.productName.toLowerCase().includes(q) || r.storeName.toLowerCase().includes(q));
    }
    if (selectedCategory !== 'all') list = list.filter((r) => r.category === selectedCategory);
    switch (sortBy) {
      case 'date': list.sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()); break;
      case 'amount': list.sort((a, b) => b.amount - a.amount); break;
      case 'expiry': list.sort((a, b) => daysUntilExpiry(a.warrantyExpiryDate) - daysUntilExpiry(b.warrantyExpiryDate)); break;
    }
    return list;
  }, [receipts, searchQuery, selectedCategory, sortBy]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>All Receipts</Text>
        <Menu
          visible={sortMenuVisible}
          onDismiss={() => setSortMenuVisible(false)}
          anchor={
            <TouchableOpacity
              onPress={() => setSortMenuVisible(true)}
              style={[styles.sortButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <Text style={[styles.sortText, { color: colors.textSecondary }]}>
                {sortBy === 'date' ? '📅 Date' : sortBy === 'amount' ? '💰 Amount' : '⏰ Expiry'}
              </Text>
            </TouchableOpacity>
          }
        >
          <Menu.Item onPress={() => { setSortBy('date'); setSortMenuVisible(false); }} title="📅 Date" />
          <Menu.Item onPress={() => { setSortBy('amount'); setSortMenuVisible(false); }} title="💰 Amount" />
          <Menu.Item onPress={() => { setSortBy('expiry'); setSortMenuVisible(false); }} title="⏰ Expiry" />
        </Menu>
      </View>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search receipts..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}
          inputStyle={[styles.searchInput, { color: colors.textPrimary }]}
          iconColor={colors.textTertiary}
          placeholderTextColor={colors.textTertiary}
          elevation={0}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
        {FILTER_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <TouchableOpacity
              key={cat}
              style={[
                styles.chip,
                { backgroundColor: isSelected ? colors.primary : colors.card, borderColor: isSelected ? colors.primary : colors.border },
              ]}
              onPress={() => setSelectedCategory(cat)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, { color: isSelected ? '#fff' : colors.textSecondary }]}>
                {cat === 'all' ? 'All' : `${CATEGORY_ICONS[cat]} ${CATEGORY_LABELS[cat]}`}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {filteredReceipts.length === 0 ? (
        <EmptyState
          title="No receipts found"
          message={searchQuery || selectedCategory !== 'all' ? 'Try adjusting your search or filters.' : 'Tap + to add your first receipt!'}
          emoji="🔍"
        />
      ) : (
        <FlatList
          data={filteredReceipts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ReceiptCard receipt={item} onPress={() => router.push(`/receipt/${item.id}`)} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      <FAB icon="plus" style={[styles.fab, { backgroundColor: colors.primary }]} color="#fff" onPress={() => router.push('/receipt/add')} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.xl, paddingTop: SPACING.base, paddingBottom: SPACING.sm,
  },
  title: { fontSize: FONTS.sizes['2xl'], fontWeight: '800' },
  sortButton: { borderRadius: BORDER_RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderWidth: 1 },
  sortText: { fontSize: FONTS.sizes.xs, fontWeight: '600' },
  searchContainer: { paddingHorizontal: SPACING.xl, paddingBottom: SPACING.sm },
  searchBar: { borderRadius: BORDER_RADIUS.md, borderWidth: 1 },
  searchInput: { fontSize: FONTS.sizes.sm },
  chipsRow: { paddingHorizontal: SPACING.xl, paddingBottom: SPACING.md, gap: SPACING.sm },
  chip: { borderRadius: BORDER_RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderWidth: 1 },
  chipText: { fontSize: FONTS.sizes.xs, fontWeight: '600' },
  listContent: { paddingHorizontal: SPACING.xl, paddingBottom: 100 },
  fab: { position: 'absolute', right: SPACING.xl, bottom: SPACING.xl, borderRadius: BORDER_RADIUS.full },
});
