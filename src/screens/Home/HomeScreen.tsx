import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { GearSix, Plus, CaretLeft, CaretRight } from 'phosphor-react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/navigationTypes';
import { useTheme } from '../../context/ThemeContext';
import { typography, spacing, borderRadius } from '../../constants/typography';
import { formatINR, formatINRShort } from '../../utils/formatCurrency';
import { getCurrentMonth, getPeriodRange } from '../../utils/dateHelpers';
import { format, subMonths, addMonths, startOfMonth, endOfMonth } from 'date-fns';
import { getMonthlySpending, getMonthlyIncome, getRecentTransactions, getTransactionsByPeriod, updateTransactionCategory } from '../../services/db/transactionQueries';
import { getBudget } from '../../services/db/budgetQueries';
import { getAllCategories } from '../../services/db/categoryQueries';
import { Transaction } from '../../types/transaction';
import { Budget } from '../../types/budget';
import { Category } from '../../types/category';
import Card from '../../components/common/Card';
import AnimatedNumber from '../../components/common/AnimatedNumber';

type NavProp = StackNavigationProp<RootStackParamList>;

const HomeScreen: React.FC = () => {
  const { colors } = useTheme();
  const db = useSQLiteContext();
  const navigation = useNavigation<NavProp>();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [spending, setSpending] = useState(0);
  const [weeklySpending, setWeeklySpending] = useState(0);
  const [income, setIncome] = useState(0);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryPickerTxId, setCategoryPickerTxId] = useState<string | null>(null);

  const selectedMonth = format(selectedDate, 'yyyy-MM');
  const isCurrentMonth = selectedMonth === getCurrentMonth();
  const monthLabel = format(selectedDate, 'MMMM yyyy');

  const goToPrevMonth = () => setSelectedDate((d) => subMonths(d, 1));
  const goToNextMonth = () => {
    if (!isCurrentMonth) setSelectedDate((d) => addMonths(d, 1));
  };

  const loadData = useCallback(async () => {
    try {
      const month = selectedMonth;
      const monthStart = startOfMonth(selectedDate).getTime();
      const monthEnd = endOfMonth(selectedDate).getTime();
      const weekRange = getPeriodRange('week');
      const [sp, inc, bud, txns, cats, weekTxns] = await Promise.all([
        getMonthlySpending(db, month),
        getMonthlyIncome(db, month),
        getBudget(db, month),
        getTransactionsByPeriod(db, monthStart, monthEnd),
        getAllCategories(db),
        isCurrentMonth
          ? getTransactionsByPeriod(db, weekRange.from.getTime(), weekRange.to.getTime())
          : Promise.resolve([]),
      ]);
      setSpending(sp);
      setIncome(inc);
      setBudget(bud);
      // Show latest 5 transactions for the selected month
      setTransactions(txns.slice(0, 5));
      setCategories(cats);
      const weekSpent = weekTxns
        .filter((t: Transaction) => t.type === 'debit')
        .reduce((sum: number, t: Transaction) => sum + t.amount, 0);
      setWeeklySpending(weekSpent);
    } catch (error) {
      console.warn('Failed to load home data:', error);
    }
  }, [db, selectedMonth, selectedDate, isCurrentMonth]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const budgetLimit = budget?.limit_amt ?? 0;
  const budgetRatio = budgetLimit > 0 ? spending / budgetLimit : 0;
  const budgetExceeded = budgetRatio > 1;

  const getProgressColor = () => {
    if (budgetRatio > 1) return colors.danger;
    if (budgetRatio > 0.75) return colors.amber;
    return colors.accent;
  };

  const handleCategorySelect = async (categoryId: string) => {
    if (!categoryPickerTxId) return;
    await updateTransactionCategory(db, categoryPickerTxId, categoryId);
    setCategoryPickerTxId(null);
    loadData();
  };

  const getCategoryForTx = (catId: string | null) =>
    categories.find((c) => c.id === catId);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bgPrimary }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
          <Text style={[typography.titleLarge, { color: colors.textPrimary }]}>
            ArthSaathi
          </Text>
          <Pressable
            style={styles.iconBtn}
            onPress={() => navigation.navigate('MainTabs', { screen: 'Settings' })}
          >
            <GearSix size={24} color={colors.textSecondary} />
          </Pressable>
        </Animated.View>

        {/* Month Navigation */}
        <Animated.View entering={FadeInDown.delay(50).duration(400)} style={styles.monthNav}>
          <Pressable onPress={goToPrevMonth} hitSlop={8}>
            <CaretLeft size={22} color={colors.textSecondary} weight="bold" />
          </Pressable>
          <Pressable onPress={() => setSelectedDate(new Date())}>
            <Text style={[typography.labelLarge, { color: colors.textPrimary }]}>
              {monthLabel}
            </Text>
          </Pressable>
          <Pressable onPress={goToNextMonth} hitSlop={8}>
            <CaretRight
              size={22}
              color={isCurrentMonth ? colors.bgTertiary : colors.textSecondary}
              weight="bold"
            />
          </Pressable>
        </Animated.View>

        {/* Budget Exceeded Warning */}
        {budgetExceeded && (
          <Animated.View
            entering={FadeInDown.delay(100).duration(400)}
            style={[styles.warningBanner, { backgroundColor: colors.dangerSoft }]}
          >
            <Text style={[typography.bodyMedium, { color: colors.danger }]}>
              You've exceeded your monthly budget by {formatINR(spending - budgetLimit)}
            </Text>
          </Animated.View>
        )}

        {/* Hero Card */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)}>
          <Card style={styles.heroCard}>
            <Text style={[typography.bodyMedium, { color: colors.textSecondary }]}>
              {isCurrentMonth ? "This Month's Spending" : `${format(selectedDate, 'MMMM')} Spending`}
            </Text>
            <AnimatedNumber value={spending} style={{ marginVertical: spacing.sm }} />
            {budgetLimit > 0 && (
              <>
                <Text style={[typography.bodyMedium, { color: colors.textTertiary }]}>
                  of {formatINR(budgetLimit)} budget
                </Text>
                <View style={[styles.progressTrack, { backgroundColor: colors.bgTertiary }]}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        backgroundColor: getProgressColor(),
                        width: `${Math.min(budgetRatio * 100, 100)}%`,
                      },
                    ]}
                  />
                </View>
              </>
            )}
          </Card>
        </Animated.View>

        {/* Quick Stats */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={[typography.bodyMedium, { color: colors.textSecondary }]}>
              Weekly Spend
            </Text>
            <Text style={[typography.monoAmount, { color: colors.danger, marginTop: spacing.xs }]}>
              {formatINRShort(weeklySpending)}
            </Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={[typography.bodyMedium, { color: colors.textSecondary }]}>
              Income
            </Text>
            <Text style={[typography.monoAmount, { color: colors.accent, marginTop: spacing.xs }]}>
              {formatINRShort(income)}
            </Text>
          </Card>
        </Animated.View>

        {/* Recent Transactions */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <View style={styles.sectionHeader}>
            <Text style={[typography.titleMedium, { color: colors.textPrimary }]}>
              Recent Transactions
            </Text>
            <Pressable onPress={() => navigation.navigate('MainTabs', { screen: 'Transactions' })}>
              <Text style={[typography.labelLarge, { color: colors.accent }]}>
                View all &rarr;
              </Text>
            </Pressable>
          </View>

          {transactions.length === 0 ? (
            <Card>
              <Text style={[typography.bodyMedium, { color: colors.textTertiary, textAlign: 'center' }]}>
                No transactions yet. Tap + to add one.
              </Text>
            </Card>
          ) : (
            transactions.map((tx, index) => {
              const cat = getCategoryForTx(tx.category_id);
              return (
                <Animated.View
                  key={tx.id}
                  entering={FadeInDown.delay(350 + index * 60).duration(400)}
                >
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
                          {cat?.name ?? 'Uncategorized'} &middot; {tx.source}
                        </Text>
                      </View>
                      <Text
                        style={[
                          typography.monoAmount,
                          {
                            color: tx.type === 'debit' ? colors.danger : colors.accent,
                          },
                        ]}
                      >
                        {tx.type === 'debit' ? '-' : '+'}
                        {formatINR(tx.amount)}
                      </Text>
                    </View>
                  </Card>
                </Animated.View>
              );
            })
          )}
        </Animated.View>
      </ScrollView>

      {/* Category Picker Modal */}
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
            <ScrollView showsVerticalScrollIndicator={false} bounces={false} style={styles.catScroll}>
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  iconBtn: {
    padding: spacing.xs,
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  warningBanner: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  heroCard: {
    marginBottom: spacing.md,
  },
  progressTrack: {
    height: 8,
    borderRadius: borderRadius.pill,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.pill,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
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
  catScroll: {
    flexGrow: 0,
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

export default HomeScreen;
