import React, { useMemo } from 'react';
import { SectionList, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { typography, spacing } from '../../constants/typography';
import { Transaction } from '../../types/transaction';
import { Category } from '../../types/category';
import { getDateLabel } from '../../utils/dateHelpers';
import TransactionCard from './TransactionCard';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  onTransactionPress?: (tx: Transaction) => void;
  onCategoryPress?: (tx: Transaction) => void;
}

interface TransactionSection {
  title: string;
  data: Transaction[];
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  categories,
  onTransactionPress,
  onCategoryPress,
}) => {
  const { colors } = useTheme();

  const categoryMap = useMemo(() => {
    const map = new Map<string, Category>();
    categories.forEach((c) => map.set(c.id, c));
    return map;
  }, [categories]);

  const sections: TransactionSection[] = useMemo(() => {
    const grouped = new Map<string, Transaction[]>();

    const sorted = [...transactions].sort((a, b) => b.timestamp - a.timestamp);
    sorted.forEach((tx) => {
      const label = getDateLabel(tx.timestamp);
      const existing = grouped.get(label);
      if (existing) {
        existing.push(tx);
      } else {
        grouped.set(label, [tx]);
      }
    });

    return Array.from(grouped.entries()).map(([title, data]) => ({
      title,
      data,
    }));
  }, [transactions]);

  const renderSectionHeader = ({ section }: { section: TransactionSection }) => (
    <View style={[styles.sectionHeader, { backgroundColor: colors.bgPrimary }]}>
      <Text style={[typography.labelLarge, { color: colors.textSecondary }]}>
        {section.title}
      </Text>
    </View>
  );

  const renderItem = ({ item }: { item: Transaction }) => {
    const category = item.category_id ? categoryMap.get(item.category_id) ?? null : null;
    return (
      <TransactionCard
        transaction={item}
        category={category}
        onPress={() => onTransactionPress?.(item)}
        onCategoryPress={() => onCategoryPress?.(item)}
      />
    );
  };

  if (transactions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[typography.titleMedium, { color: colors.textTertiary }]}>
          No transactions yet
        </Text>
        <Text
          style={[
            typography.bodyMedium,
            { color: colors.textTertiary, marginTop: spacing.sm, textAlign: 'center' },
          ]}
        >
          Your SMS transactions will appear here once detected.
        </Text>
      </View>
    );
  }

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      stickySectionHeadersEnabled
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
    />
  );
};

const styles = StyleSheet.create({
  sectionHeader: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  listContent: {
    paddingBottom: spacing.xxl,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl * 2,
  },
});

export default TransactionList;
