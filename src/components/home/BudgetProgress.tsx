import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { typography, spacing, borderRadius } from '../../constants/typography';
import { formatINRShort } from '../../utils/formatCurrency';

interface BudgetProgressProps {
  spent: number;
  limit: number;
}

const BudgetProgress: React.FC<BudgetProgressProps> = ({ spent, limit }) => {
  const { colors } = useTheme();
  const ratio = limit > 0 ? spent / limit : 0;
  const remaining = Math.max(limit - spent, 0);

  const getColor = () => {
    if (ratio > 1) return colors.danger;
    if (ratio >= 0.9) return colors.orange;
    if (ratio >= 0.7) return colors.amber;
    return colors.accent;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bgSecondary }]}>
      <View style={styles.row}>
        <Text style={[typography.labelLarge, { color: colors.textSecondary }]}>Budget</Text>
        <Text style={[typography.monoAmount, { color: getColor() }]}>
          {Math.round(ratio * 100)}%
        </Text>
      </View>
      <View style={[styles.bar, { backgroundColor: colors.bgTertiary }]}>
        <View
          style={[styles.fill, { width: `${Math.min(ratio * 100, 100)}%`, backgroundColor: getColor() }]}
        />
      </View>
      <Text style={[typography.bodyMedium, { color: colors.textTertiary, marginTop: spacing.xs }]}>
        {ratio > 1
          ? `Over by ${formatINRShort(spent - limit)}`
          : `${formatINRShort(remaining)} remaining`}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bar: {
    height: 6,
    borderRadius: 3,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
});

export default BudgetProgress;
