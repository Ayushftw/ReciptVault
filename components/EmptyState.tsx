import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { FONTS, SPACING } from '../utils/constants';

interface EmptyStateProps {
  title: string;
  message: string;
  emoji?: string;
}

export function EmptyState({ title, message, emoji = '📭' }: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
      <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING['2xl'],
    paddingVertical: SPACING['4xl'],
  },
  emoji: { fontSize: 56, marginBottom: SPACING.base },
  title: { fontSize: FONTS.sizes.lg, fontWeight: '700', textAlign: 'center' },
  message: { fontSize: FONTS.sizes.sm, textAlign: 'center', marginTop: SPACING.sm, lineHeight: 20 },
});
