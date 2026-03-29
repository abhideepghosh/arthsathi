import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSQLiteContext } from 'expo-sqlite';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { typography, spacing, borderRadius } from '../../constants/typography';
import { formatINR, formatINRShort } from '../../utils/formatCurrency';
import { getCurrentMonth } from '../../utils/dateHelpers';
import { getBudget, setBudget as saveBudget, getRecentBudgets } from '../../services/db/budgetQueries';
import { getMonthlySpending } from '../../services/db/transactionQueries';
import { Budget } from '../../types/budget';
import Card from '../../components/common/Card';

const PRESETS = [10000, 15000, 20000, 30000, 50000];

const BudgetScreen: React.FC = () => {
  const { colors } = useTheme();
  const db = useSQLiteContext();

  const [showSheet, setShowSheet] = useState(false);
  const [budget, setBudgetState] = useState<Budget | null>(null);
  const [spending, setSpending] = useState(0);
  const [recentBudgets, setRecentBudgets] = useState<(Budget & { actual?: number })[]>([]);
  const [budgetInput, setBudgetInput] = useState('');

  const loadData = useCallback(async () => {
    try {
      const month = getCurrentMonth();
      const [bud, sp, recent] = await Promise.all([
        getBudget(db, month),
        getMonthlySpending(db, month),
        getRecentBudgets(db, 3),
      ]);
      setBudgetState(bud);
      setSpending(sp);

      // Load actual spending for recent budgets
      const enriched = await Promise.all(
        recent.map(async (b) => {
          const actual = await getMonthlySpending(db, b.month);
          return { ...b, actual };
        }),
      );
      setRecentBudgets(enriched);
    } catch (error) {
      console.warn('Failed to load budget data:', error);
    }
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const budgetLimit = budget?.limit_amt ?? 0;
  const ratio = budgetLimit > 0 ? Math.min(spending / budgetLimit, 1) : 0;
  const percentage = Math.round(ratio * 100);

  const getRingColor = () => {
    if (budgetLimit === 0) return colors.bgTertiary;
    if (spending > budgetLimit) return colors.danger;
    if (ratio > 0.75) return colors.amber;
    return colors.accent;
  };

  const handleOpenSheet = () => {
    setBudgetInput(budgetLimit > 0 ? budgetLimit.toString() : '');
    setShowSheet(true);
  };

  const handleSaveBudget = async () => {
    const amt = parseFloat(budgetInput);
    if (!amt || amt <= 0) return;
    await saveBudget(db, getCurrentMonth(), amt);
    setShowSheet(false);
    loadData();
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bgPrimary }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeIn.duration(400)}>
          <Text style={[typography.titleLarge, { color: colors.textPrimary, marginBottom: spacing.lg }]}>
            Budget
          </Text>
        </Animated.View>

        {/* Circular Progress */}
        <Animated.View entering={FadeInDown.delay(80).duration(500)} style={styles.ringWrap}>
          <View
            style={[
              styles.ringOuter,
              { borderColor: colors.bgTertiary },
            ]}
          >
            <View
              style={[
                styles.ringProgress,
                {
                  borderColor: getRingColor(),
                  borderTopColor: getRingColor(),
                  borderRightColor: ratio > 0.25 ? getRingColor() : colors.bgTertiary,
                  borderBottomColor: ratio > 0.5 ? getRingColor() : colors.bgTertiary,
                  borderLeftColor: ratio > 0.75 ? getRingColor() : colors.bgTertiary,
                },
              ]}
            />
            <View style={styles.ringCenter}>
              <Text style={[typography.monoAmountLg, { color: colors.textPrimary }]}>
                {formatINRShort(spending)}
              </Text>
              {budgetLimit > 0 ? (
                <Text style={[typography.bodyMedium, { color: colors.textSecondary }]}>
                  of {formatINR(budgetLimit)}
                </Text>
              ) : (
                <Text style={[typography.bodyMedium, { color: colors.textTertiary }]}>
                  No budget set
                </Text>
              )}
              {budgetLimit > 0 && (
                <Text
                  style={[
                    typography.labelLarge,
                    { color: getRingColor(), marginTop: spacing.xs },
                  ]}
                >
                  {percentage}%
                </Text>
              )}
            </View>
          </View>
        </Animated.View>

        {/* Set Budget Button */}
        <Animated.View entering={FadeInDown.delay(160).duration(400)} style={styles.setBtnWrap}>
          <Pressable
            onPress={handleOpenSheet}
            style={({ pressed }) => [
              styles.setBtn,
              { backgroundColor: colors.accent, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Text style={[typography.labelLarge, { color: colors.white }]}>
              {budgetLimit > 0 ? 'Update Budget' : 'Set Budget'}
            </Text>
          </Pressable>
        </Animated.View>

        {/* Recent Budgets */}
        {recentBudgets.length > 0 && (
          <Animated.View entering={FadeInDown.delay(240).duration(500)}>
            <Text
              style={[
                typography.titleMedium,
                { color: colors.textPrimary, marginBottom: spacing.md },
              ]}
            >
              Recent Budgets
            </Text>
            {recentBudgets.map((b) => {
              const actual = b.actual ?? 0;
              const isOver = actual > b.limit_amt;
              return (
                <Card key={b.id} style={styles.recentCard}>
                  <View style={styles.recentRow}>
                    <View>
                      <Text style={[typography.bodyLarge, { color: colors.textPrimary }]}>
                        {b.month}
                      </Text>
                      <Text style={[typography.bodyMedium, { color: colors.textSecondary }]}>
                        Budget: {formatINR(b.limit_amt)} &middot; Spent: {formatINR(actual)}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.badge,
                        {
                          backgroundColor: isOver ? colors.dangerSoft : `${colors.accent}20`,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          typography.labelLarge,
                          { color: isOver ? colors.danger : colors.accent },
                        ]}
                      >
                        {isOver
                          ? `Over ${formatINRShort(actual - b.limit_amt)}`
                          : `Under ${formatINRShort(b.limit_amt - actual)}`}
                      </Text>
                    </View>
                  </View>
                </Card>
              );
            })}
          </Animated.View>
        )}
      </ScrollView>

      {/* Budget Modal */}
      <Modal
        visible={showSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSheet(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowSheet(false)}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalBottom}
          >
            <Pressable
              style={[styles.sheetInner, { backgroundColor: colors.bgSecondary }]}
              onPress={() => {}}
            >
              <View style={[styles.sheetHandle, { backgroundColor: colors.textTertiary }]} />
              <Text style={[typography.titleMedium, { color: colors.textPrimary, marginBottom: spacing.lg }]}>
                Set Monthly Budget
              </Text>

              <View style={[styles.budgetInputWrap, { backgroundColor: colors.bgTertiary }]}>
                <Text style={[styles.budgetPrefix, { color: colors.textTertiary }]}>₹</Text>
                <TextInput
                  style={[
                    typography.monoAmountLg,
                    styles.budgetInputField,
                    { color: colors.textPrimary },
                  ]}
                  value={budgetInput}
                  onChangeText={setBudgetInput}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={colors.textTertiary}
                  autoFocus
                />
              </View>

              <View style={styles.presetsRow}>
                {PRESETS.map((preset) => (
                  <Pressable
                    key={preset}
                    onPress={() => setBudgetInput(preset.toString())}
                    style={[styles.presetChip, { backgroundColor: colors.bgTertiary }]}
                  >
                    <Text style={[typography.labelLarge, { color: colors.textPrimary }]}>
                      {formatINRShort(preset)}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Pressable
                onPress={handleSaveBudget}
                style={({ pressed }) => [
                  styles.sheetSaveBtn,
                  { backgroundColor: colors.accent, opacity: pressed ? 0.85 : 1 },
                ]}
              >
                <Text style={[typography.labelLarge, { color: colors.white }]}>Save</Text>
              </Pressable>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  ringWrap: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  ringOuter: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ringProgress: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 100,
    borderWidth: 12,
  },
  ringCenter: {
    alignItems: 'center',
  },
  setBtnWrap: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  setBtn: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
  },
  recentCard: {
    marginBottom: spacing.sm,
  },
  recentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.pill,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalBottom: {
    justifyContent: 'flex-end',
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  sheetInner: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    paddingTop: spacing.md,
  },
  budgetInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  budgetPrefix: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 32,
    lineHeight: 40,
    marginRight: spacing.xs,
  },
  budgetInputField: {
    flex: 1,
    padding: 0,
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  presetChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.pill,
  },
  sheetSaveBtn: {
    width: '100%',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default BudgetScreen;
