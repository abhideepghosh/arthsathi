import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import Svg, { Path, Circle, Line, Polyline } from 'react-native-svg';
import { useSQLiteContext } from 'expo-sqlite';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { typography, spacing, borderRadius } from '../../constants/typography';
import { formatINR, formatINRShort } from '../../utils/formatCurrency';
import { TimePeriod, getPeriodRange } from '../../utils/dateHelpers';
import {
  getTransactionsByPeriod,
  getCategorySpending,
  getDailySpending,
} from '../../services/db/transactionQueries';
import { Transaction } from '../../types/transaction';
import Card from '../../components/common/Card';

const PERIODS: { key: TimePeriod; label: string }[] = [
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
  { key: 'year', label: 'Year' },
];

const SCREEN_WIDTH = Dimensions.get('window').width;

// --- Donut Chart Component ---
interface DonutChartProps {
  data: { name: string; total: number; color: string }[];
  size: number;
  strokeWidth: number;
}

const DonutChart: React.FC<DonutChartProps> = ({ data, size, strokeWidth }) => {
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;
  const grandTotal = data.reduce((s, d) => s + d.total, 0);

  if (grandTotal === 0) return null;

  let cumulativeAngle = -90; // start from top

  const arcs = data.map((item) => {
    const angle = (item.total / grandTotal) * 360;
    const startAngle = cumulativeAngle;
    cumulativeAngle += angle;
    const endAngle = cumulativeAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);

    const largeArc = angle > 180 ? 1 : 0;

    const d = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;

    return { ...item, d, angle };
  });

  return (
    <Svg width={size} height={size}>
      {/* Background circle */}
      <Circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke="#333"
        strokeWidth={strokeWidth}
        opacity={0.2}
      />
      {arcs.map((arc, i) => (
        <Path
          key={i}
          d={arc.d}
          fill="none"
          stroke={arc.color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      ))}
    </Svg>
  );
};

// --- Trend Line Component ---
interface TrendLineProps {
  data: { date: string; total: number }[];
  width: number;
  height: number;
  color: string;
  gridColor: string;
  textColor: string;
}

const TrendLine: React.FC<TrendLineProps> = ({ data, width, height, color, gridColor, textColor }) => {
  if (data.length === 0) return null;

  const padding = { top: 10, bottom: 30, left: 10, right: 10 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxVal = Math.max(...data.map((d) => d.total), 1);

  const points = data.map((d, i) => {
    const x = padding.left + (data.length > 1 ? (i / (data.length - 1)) * chartW : chartW / 2);
    const y = padding.top + chartH - (d.total / maxVal) * chartH;
    return { x, y, label: d.date.slice(5) }; // "MM-DD"
  });

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ');

  // Show a few x-axis labels
  const labelStep = Math.max(1, Math.floor(data.length / 5));

  return (
    <Svg width={width} height={height}>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
        const y = padding.top + chartH * (1 - frac);
        return (
          <Line
            key={frac}
            x1={padding.left}
            y1={y}
            x2={width - padding.right}
            y2={y}
            stroke={gridColor}
            strokeWidth={0.5}
            opacity={0.3}
          />
        );
      })}
      {/* Line */}
      <Polyline
        points={polylinePoints}
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Dots */}
      {points.map((p, i) => (
        <Circle key={i} cx={p.x} cy={p.y} r={3} fill={color} />
      ))}
    </Svg>
  );
};

const AnalyticsScreen: React.FC = () => {
  const { colors } = useTheme();
  const db = useSQLiteContext();

  const [period, setPeriod] = useState<TimePeriod>('month');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categoryData, setCategoryData] = useState<
    { category_id: string; total: number; name: string; color: string; icon: string }[]
  >([]);
  const [dailyData, setDailyData] = useState<{ date: string; total: number }[]>([]);

  const loadData = useCallback(async () => {
    try {
      const { from, to } = getPeriodRange(period);
      const fromTs = from.getTime();
      const toTs = to.getTime();

      const [txns, catSpending, daily] = await Promise.all([
        getTransactionsByPeriod(db, fromTs, toTs),
        getCategorySpending(db, fromTs, toTs),
        getDailySpending(db, fromTs, toTs),
      ]);

      setTransactions(txns);
      setCategoryData(catSpending);
      setDailyData(daily);
    } catch (error) {
      console.warn('Failed to load analytics data:', error);
    }
  }, [db, period]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const totalSpent = transactions
    .filter((t) => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalReceived = transactions
    .filter((t) => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);

  const net = totalReceived - totalSpent;

  const donutData = categoryData.map((cat) => ({
    name: cat.name ?? 'Uncategorized',
    total: cat.total,
    color: cat.color ?? '#A0A0A0',
  }));

  const chartWidth = SCREEN_WIDTH - spacing.md * 2 - spacing.md * 2; // screen padding + card padding

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bgPrimary }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeIn.duration(400)}>
          <Text style={[typography.titleLarge, { color: colors.textPrimary, marginBottom: spacing.lg }]}>
            Analytics
          </Text>
        </Animated.View>

        {/* Period Toggle */}
        <Animated.View entering={FadeInDown.delay(80).duration(400)} style={styles.periodRow}>
          {PERIODS.map(({ key, label }) => {
            const isActive = period === key;
            return (
              <Pressable
                key={key}
                onPress={() => setPeriod(key)}
                style={[
                  styles.periodChip,
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

        {/* Summary Row */}
        <Animated.View entering={FadeInDown.delay(160).duration(500)}>
          <Card style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={[typography.bodyMedium, { color: colors.textSecondary }]}>Spent</Text>
                <Text style={[typography.monoAmount, { color: colors.danger }]}>
                  {formatINR(totalSpent)}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[typography.bodyMedium, { color: colors.textSecondary }]}>Received</Text>
                <Text style={[typography.monoAmount, { color: colors.accent }]}>
                  {formatINR(totalReceived)}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[typography.bodyMedium, { color: colors.textSecondary }]}>Net</Text>
                <Text
                  style={[
                    typography.monoAmount,
                    { color: net >= 0 ? colors.accent : colors.danger },
                  ]}
                >
                  {net >= 0 ? '+' : '-'}
                  {formatINR(Math.abs(net))}
                </Text>
              </View>
            </View>
          </Card>
        </Animated.View>

        {/* Spending Chart (Donut) */}
        <Animated.View entering={FadeInDown.delay(240).duration(500)}>
          <Card style={styles.chartCard}>
            <Text style={[typography.labelLarge, { color: colors.textPrimary, marginBottom: spacing.md }]}>
              Spending Breakdown
            </Text>
            {donutData.length > 0 ? (
              <View style={styles.donutContainer}>
                <DonutChart data={donutData} size={180} strokeWidth={24} />
                <View style={styles.donutCenter}>
                  <Text style={[typography.monoAmount, { color: colors.textPrimary }]}>
                    {formatINRShort(totalSpent)}
                  </Text>
                  <Text style={[typography.bodyMedium, { color: colors.textTertiary }]}>
                    Total Spent
                  </Text>
                </View>
              </View>
            ) : (
              <Text style={[typography.bodyMedium, { color: colors.textTertiary, textAlign: 'center', paddingVertical: spacing.xl }]}>
                No spending data for this period
              </Text>
            )}
          </Card>
        </Animated.View>

        {/* Category Breakdown */}
        <Animated.View entering={FadeInDown.delay(320).duration(500)}>
          <Card style={styles.chartCard}>
            <Text style={[typography.labelLarge, { color: colors.textPrimary, marginBottom: spacing.md }]}>
              Category Breakdown
            </Text>
            {categoryData.length > 0 ? (
              <View style={styles.catList}>
                {categoryData.map((cat, index) => {
                  const pct = totalSpent > 0 ? (cat.total / totalSpent) * 100 : 0;
                  return (
                    <View key={cat.category_id ?? `unknown-${index}`} style={styles.catItem}>
                      <View style={styles.catLabelRow}>
                        <View style={[styles.catDot, { backgroundColor: cat.color ?? '#A0A0A0' }]} />
                        <Text style={[typography.bodyMedium, { color: colors.textPrimary, flex: 1 }]}>
                          {cat.name ?? 'Uncategorized'}
                        </Text>
                        <Text style={[typography.monoAmount, { color: colors.textPrimary }]}>
                          {formatINR(cat.total)}
                        </Text>
                      </View>
                      <View style={[styles.barBg, { backgroundColor: colors.bgTertiary }]}>
                        <View
                          style={[
                            styles.barFill,
                            {
                              backgroundColor: cat.color ?? '#A0A0A0',
                              width: `${Math.min(pct, 100)}%`,
                            },
                          ]}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : (
              <Text style={[typography.bodyMedium, { color: colors.textTertiary, textAlign: 'center', paddingVertical: spacing.xl }]}>
                No spending data for this period
              </Text>
            )}
          </Card>
        </Animated.View>

        {/* Trend Line */}
        <Animated.View entering={FadeInDown.delay(400).duration(500)}>
          <Card style={styles.chartCard}>
            <Text style={[typography.labelLarge, { color: colors.textPrimary, marginBottom: spacing.md }]}>
              Spending Trend
            </Text>
            {dailyData.length > 1 ? (
              <TrendLine
                data={dailyData}
                width={chartWidth}
                height={180}
                color={colors.accent}
                gridColor={colors.textTertiary}
                textColor={colors.textSecondary}
              />
            ) : dailyData.length === 1 ? (
              <View style={styles.singlePointWrap}>
                <Text style={[typography.monoAmount, { color: colors.accent }]}>
                  {formatINR(dailyData[0].total)}
                </Text>
                <Text style={[typography.bodyMedium, { color: colors.textTertiary }]}>
                  {dailyData[0].date}
                </Text>
              </View>
            ) : (
              <Text style={[typography.bodyMedium, { color: colors.textTertiary, textAlign: 'center', paddingVertical: spacing.xl }]}>
                No trend data for this period
              </Text>
            )}
          </Card>
        </Animated.View>
      </ScrollView>
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
  periodRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  periodChip: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.pill,
    alignItems: 'center',
  },
  summaryCard: {
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  chartCard: {
    marginBottom: spacing.md,
  },
  donutContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: 180,
  },
  donutCenter: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catList: {
    gap: spacing.md,
  },
  catItem: {
    gap: spacing.xs,
  },
  catLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  catDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  barBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  singlePointWrap: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.xs,
  },
});

export default AnalyticsScreen;
