import React from 'react';
import { Pressable, StyleSheet, View, Text } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import {
  ForkKnife,
  ShoppingCart,
  Car,
  Bag,
  FilmSlate,
  Lightning,
  Heart,
  BookOpen,
  Airplane,
  House,
  Repeat,
  Bank,
  GasPump,
  TrendUp,
  DotsThree,
  Wallet,
  Users,
  UsersThree,
  CellSignalFull,
  ShieldCheck,
  Question,
  IconProps,
} from 'phosphor-react-native';
import { useTheme } from '../../context/ThemeContext';
import { typography, spacing, borderRadius } from '../../constants/typography';
import { Transaction } from '../../types/transaction';
import { Category } from '../../types/category';
import { formatINR } from '../../utils/formatCurrency';
import { formatTime } from '../../utils/dateHelpers';

type PhosphorIcon = React.FC<IconProps>;

const ICON_MAP: Record<string, PhosphorIcon> = {
  ForkKnife,
  ShoppingCart,
  Car,
  Bag,
  FilmSlate,
  Lightning,
  Heart,
  BookOpen,
  Airplane,
  House,
  Repeat,
  Bank,
  GasPump,
  TrendUp,
  DotsThree,
  Wallet,
  Users,
  UsersThree,
  CellSignalFull,
  ShieldCheck,
  Question,
};

export const getIconComponent = (iconName: string): PhosphorIcon => {
  return ICON_MAP[iconName] ?? Question;
};

const SOURCE_LABELS: Record<string, string> = {
  upi: 'UPI',
  bank: 'Bank Transfer',
  credit_card: 'Credit Card',
  debit_card: 'Debit Card',
  cash: 'Cash',
  other: 'Other',
};

interface TransactionCardProps {
  transaction: Transaction;
  category?: Category | null;
  onPress?: () => void;
  onCategoryPress?: () => void;
}

const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  category,
  onPress,
  onCategoryPress,
}) => {
  const { colors } = useTheme();
  const isDebit = transaction.type === 'debit';

  const iconColor = category?.color ?? colors.textTertiary;
  const IconComponent = getIconComponent(category?.icon ?? 'Question');

  const displayName = transaction.merchant ?? SOURCE_LABELS[transaction.source] ?? 'Unknown';
  const amountText = `${isDebit ? '-' : '+'}${formatINR(transaction.amount)}`;
  const amountColor = isDebit ? colors.danger : colors.accentLight;

  const bankInfo =
    transaction.bank && transaction.account_last4
      ? `${transaction.bank} ****${transaction.account_last4}`
      : transaction.bank ?? null;

  return (
    <Animated.View entering={FadeInRight.duration(300)}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.container,
          { backgroundColor: colors.bgPrimary, opacity: pressed ? 0.7 : 1 },
        ]}
      >
        {/* Icon */}
        <View
          style={[
            styles.iconBox,
            { backgroundColor: `${iconColor}26` },
          ]}
        >
          <IconComponent size={22} color={iconColor} weight="fill" />
        </View>

        {/* Middle content */}
        <View style={styles.middle}>
          <Text
            style={[typography.bodyLarge, { color: colors.textPrimary }]}
            numberOfLines={1}
          >
            {displayName}
          </Text>

          <View style={styles.metaRow}>
            {category && (
              <Pressable onPress={onCategoryPress}>
                <View
                  style={[
                    styles.categoryBadge,
                    { backgroundColor: `${iconColor}1A` },
                  ]}
                >
                  <Text
                    style={[
                      typography.bodyMedium,
                      { color: iconColor, fontSize: 12 },
                    ]}
                    numberOfLines={1}
                  >
                    {category.name}
                  </Text>
                </View>
              </Pressable>
            )}
            <Text
              style={[typography.bodyMedium, { color: colors.textSecondary }]}
              numberOfLines={1}
            >
              {SOURCE_LABELS[transaction.source] ?? transaction.source}
            </Text>
            {bankInfo && (
              <Text
                style={[
                  typography.bodyMedium,
                  { color: colors.textTertiary, marginLeft: spacing.xs },
                ]}
                numberOfLines={1}
              >
                {bankInfo}
              </Text>
            )}
          </View>
        </View>

        {/* Amount + time */}
        <View style={styles.right}>
          <Text
            style={[
              typography.monoAmount,
              { color: amountColor },
            ]}
          >
            {amountText}
          </Text>
          <Text
            style={[
              typography.bodyMedium,
              { color: colors.textTertiary, textAlign: 'right' },
            ]}
          >
            {formatTime(transaction.timestamp)}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  middle: {
    flex: 1,
    marginLeft: spacing.md,
    marginRight: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  categoryBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.pill,
  },
  right: {
    alignItems: 'flex-end',
  },
});

export default TransactionCard;
