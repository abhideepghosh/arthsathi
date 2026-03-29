import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';
import { typography, spacing, borderRadius } from '../../constants/typography';
import { formatINR, formatINRShort } from '../../utils/formatCurrency';

interface BalanceSummaryProps {
  spent: number;
  budgetLimit: number | null;
}

const BalanceSummary: React.FC<BalanceSummaryProps> = ({ spent, budgetLimit }) => {
  const { colors } = useTheme();
  const ratio = budgetLimit ? spent / budgetLimit : 0;

  const getBarColor = () => {
    if (ratio > 1) return colors.danger;
    if (ratio >= 0.9) return colors.orange;
    if (ratio >= 0.7) return colors.amber;
    return colors.accent;
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(100).springify()}
      style={[styles.card, { backgroundColor: colors.bgSecondary }]}
    >
      <Text style={[typography.labelLarge, { color: colors.textSecondary }]}>
        This Month's Spending
      </Text>
      <Text style={[typography.displayMedium, { color: colors.textPrimary, marginTop: spacing.xs }]}>
        {formatINR(spent)}
      </Text>
      {budgetLimit && (
        <>
          <Text style={[typography.bodyMedium, { color: colors.textTertiary, marginTop: spacing.xs }]}>
            of {formatINRShort(budgetLimit)} budget
          </Text>
          <View style={[styles.barBg, { backgroundColor: colors.bgTertiary }]}>
            <View
              style={[
                styles.barFill,
                {
                  backgroundColor: getBarColor(),
                  width: `${Math.min(ratio * 100, 100)}%`,
                },
              ]}
            />
          </View>
          <Text style={[typography.bodyMedium, { color: colors.textTertiary, marginTop: spacing.xs }]}>
            {Math.round(ratio * 100)}% used
          </Text>
        </>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  barBg: {
    height: 8,
    borderRadius: 4,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
});

export default BalanceSummary;
