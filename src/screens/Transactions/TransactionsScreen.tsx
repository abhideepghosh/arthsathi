import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  FlatList,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { MagnifyingGlass, Plus } from 'phosphor-react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/navigationTypes';
import { useTheme } from '../../context/ThemeContext';
import { typography, spacing, borderRadius } from '../../constants/typography';
import { formatINR } from '../../utils/formatCurrency';
import { getDateLabel, formatTime } from '../../utils/dateHelpers';
import {
  getRecentTransactions,
  getTransactionsByType,
  getUncategorizedTransactions,
  searchTransactions,
  updateTransactionCategory,
} from '../../services/db/transactionQueries';
import { getAllCategories } from '../../services/db/categoryQueries';
import { Transaction, TransactionType } from '../../types/transaction';
import { Category } from '../../types/category';
import Card from '../../components/common/Card';

type NavProp = StackNavigationProp<RootStackParamList>;

type FilterType = 'all' | 'debit' | 'credit' | 'uncategorized';

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'debit', label: 'Debit' },
  { key: 'credit', label: 'Credit' },
  { key: 'uncategorized', label: 'Uncategorized' },
];

const TransactionsScreen: React.FC = () => {
  const { colors } = useTheme();
  const db = useSQLiteContext();
  const navigation = useNavigation<NavProp>();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [categoryPickerTxId, setCategoryPickerTxId] = useState<string | null>(null);

  // Debounce search input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const loadTransactions = useCallback(async () => {
    try {
      let txns: Transaction[];

      if (debouncedSearch.trim().length > 0) {
        txns = await searchTransactions(db, debouncedSearch.trim());
      } else {
        switch (activeFilter) {
          case 'debit':
            txns = await getTransactionsByType(db, 'debit');
            break;
          case 'credit':
            txns = await getTransactionsByType(db, 'credit');
            break;
          case 'uncategorized':
            txns = await getUncategorizedTransactions(db);
            break;
          default:
            txns = await getRecentTransactions(db, 100);
        }
      }

      setTransactions(txns);
    } catch (error) {
      console.warn('Failed to load transactions:', error);
    }
  }, [db, debouncedSearch, activeFilter]);

  const loadCategories = useCallback(async () => {
    try {
      const cats = await getAllCategories(db);
      setCategories(cats);
    } catch (error) {
      console.warn('Failed to load categories:', error);
    }
  }, [db]);

  // Reload on search/filter change
  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Reload categories on focus
  useFocusEffect(
    useCallback(() => {
      loadTransactions();
      loadCategories();
    }, [loadTransactions, loadCategories]),
  );

  const handleCategorySelect = async (categoryId: string) => {
    if (!categoryPickerTxId) return;
    await updateTransactionCategory(db, categoryPickerTxId, categoryId);
    setCategoryPickerTxId(null);
    loadTransactions();
  };

  const getCategoryForTx = (catId: string | null) =>
    categories.find((c) => c.id === catId);

  const renderTransaction = ({ item: tx }: { item: Transaction }) => {
    const cat = getCategoryForTx(tx.category_id);
    return (
      <Card style={styles.txCard} onPress={() => setCategoryPickerTxId(tx.id)}>
        <View style={styles.txRow}>
          <View style={styles.txInfo}>
            <Text
              style={[typography.bodyLarge, { color: colors.textPrimary }]}
              numberOfLines={1}
            >
              {tx.merchant ?? tx.note ?? 'Transaction'}
            </Text>
            <Text style={[typography.bodyMedium, { color: colors.textTertiary }]}>
              {cat?.name ?? 'Uncategorized'} &middot; {getDateLabel(tx.timestamp)} &middot; {formatTime(tx.timestamp)}
            </Text>
          </View>
          <Text
            style={[
              typography.monoAmount,
              { color: tx.type === 'debit' ? colors.danger : colors.accent },
            ]}
          >
            {tx.type === 'debit' ? '-' : '+'}
            {formatINR(tx.amount)}
          </Text>
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bgPrimary }]}>
      {/* Header */}
      <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
        <Text style={[typography.titleLarge, { color: colors.textPrimary }]}>
          Transactions
        </Text>
      </Animated.View>

      {/* Search */}
      <Animated.View entering={FadeInDown.delay(80).duration(400)} style={styles.searchWrap}>
        <View style={[styles.searchBar, { backgroundColor: colors.bgSecondary }]}>
          <MagnifyingGlass size={20} color={colors.textTertiary} />
          <TextInput
            style={[typography.bodyMedium, styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search transactions..."
            placeholderTextColor={colors.textTertiary}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </Animated.View>

      {/* Filter Chips */}
      <Animated.View entering={FadeInDown.delay(160).duration(400)} style={styles.filtersRow}>
        {FILTERS.map(({ key, label }) => {
          const isActive = activeFilter === key;
          return (
            <Pressable
              key={key}
              onPress={() => setActiveFilter(key)}
              style={[
                styles.chip,
                {
                  backgroundColor: isActive ? colors.accent : colors.bgSecondary,
                },
              ]}
            >
              <Text
                style={[
                  typography.labelLarge,
                  { color: isActive ? colors.white : colors.textSecondary },
                ]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </Animated.View>

      {/* Transaction List */}
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={renderTransaction}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={[typography.bodyMedium, { color: colors.textTertiary, textAlign: 'center' }]}>
              No transactions found
            </Text>
          </View>
        }
      />

      {/* Category Picker Bottom Sheet */}
      {categoryPickerTxId && (
        <Pressable
          style={styles.sheetOverlay}
          onPress={() => setCategoryPickerTxId(null)}
        >
          <Pressable
            style={[styles.sheetContent, { backgroundColor: colors.bgSecondary }]}
            onPress={() => {}}
          >
            <Text style={[typography.titleMedium, { color: colors.textPrimary, marginBottom: spacing.md }]}>
              Pick a Category
            </Text>
            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
              {categories.map((cat) => (
                <Pressable
                  key={cat.id}
                  onPress={() => handleCategorySelect(cat.id)}
                  style={[styles.catRow, { backgroundColor: colors.bgTertiary }]}
                >
                  <View style={[styles.catColorDot, { backgroundColor: cat.color }]} />
                  <Text style={[typography.bodyLarge, { color: colors.textPrimary }]}>
                    {cat.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      )}

      {/* FAB */}
      <Pressable
        onPress={() => navigation.navigate('AddTransaction')}
        style={({ pressed }) => [
          styles.fab,
          { backgroundColor: colors.accent, opacity: pressed ? 0.85 : 1 },
        ]}
      >
        <Plus size={28} color={colors.white} weight="bold" />
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  searchWrap: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    padding: 0,
  },
  filtersRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.pill,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: 100,
  },
  txCard: {
    marginBottom: spacing.sm,
  },
  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  txInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  emptyWrap: {
    paddingTop: spacing.xxl,
  },
  sheetOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheetContent: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    maxHeight: '60%',
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  catColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
});

export default TransactionsScreen;
