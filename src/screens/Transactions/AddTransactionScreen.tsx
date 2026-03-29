import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { X } from 'phosphor-react-native';
import * as Haptics from 'expo-haptics';
import { useSQLiteContext } from 'expo-sqlite';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/navigationTypes';
import { useTheme } from '../../context/ThemeContext';
import { typography, spacing, borderRadius } from '../../constants/typography';
import { formatDate } from '../../utils/dateHelpers';
import { saveManualTransaction } from '../../services/db/transactionQueries';
import { getAllCategories } from '../../services/db/categoryQueries';
import { TransactionType, TransactionSource } from '../../types/transaction';
import { Category } from '../../types/category';

type NavProp = StackNavigationProp<RootStackParamList>;

const SOURCES: { key: TransactionSource; label: string }[] = [
  { key: 'cash', label: 'Cash' },
  { key: 'upi', label: 'UPI' },
  { key: 'credit_card', label: 'Card' },
  { key: 'bank', label: 'Bank' },
  { key: 'other', label: 'Other' },
];

const AddTransactionScreen: React.FC = () => {
  const { colors } = useTheme();
  const db = useSQLiteContext();
  const navigation = useNavigation<NavProp>();

  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('debit');
  const [source, setSource] = useState<TransactionSource>('upi');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const loadCategories = useCallback(async () => {
    const cats = await getAllCategories(db);
    setCategories(cats);
  }, [db]);

  React.useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const selectedCategory = categories.find((c) => c.id === categoryId);

  const handleSave = async () => {
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter an amount greater than zero.');
      return;
    }

    await saveManualTransaction(db, {
      amount: parsedAmount,
      type,
      source,
      merchant: null,
      bank: null,
      account_last4: null,
      raw_sms: null,
      category_id: categoryId,
      note: note.trim() || null,
      timestamp: Date.now(),
    });

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bgPrimary }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[typography.titleLarge, { color: colors.textPrimary }]}>
          Add Transaction
        </Text>
        <Pressable onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <X size={24} color={colors.textSecondary} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Amount Input */}
        <Animated.View entering={FadeInDown.delay(0).duration(400)} style={styles.amountWrap}>
          <Text
            style={[
              styles.currencyPrefix,
              { color: colors.textTertiary, fontFamily: 'DMMono_500Medium' },
            ]}
          >
            ₹
          </Text>
          <TextInput
            style={[
              styles.amountInput,
              {
                color: colors.textPrimary,
                fontFamily: 'DMMono_500Medium',
              },
            ]}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={colors.textTertiary}
            autoFocus
          />
        </Animated.View>

        {/* Debit / Credit Toggle */}
        <Animated.View entering={FadeInDown.delay(80).duration(400)} style={styles.toggleRow}>
          <Pressable
            onPress={() => setType('debit')}
            style={[
              styles.togglePill,
              {
                backgroundColor:
                  type === 'debit' ? colors.dangerSoft : colors.bgSecondary,
                borderColor: type === 'debit' ? colors.danger : 'transparent',
                borderWidth: 1,
              },
            ]}
          >
            <Text
              style={[
                typography.labelLarge,
                { color: type === 'debit' ? colors.danger : colors.textSecondary },
              ]}
            >
              Debit
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setType('credit')}
            style={[
              styles.togglePill,
              {
                backgroundColor:
                  type === 'credit' ? `${colors.accent}20` : colors.bgSecondary,
                borderColor: type === 'credit' ? colors.accent : 'transparent',
                borderWidth: 1,
              },
            ]}
          >
            <Text
              style={[
                typography.labelLarge,
                { color: type === 'credit' ? colors.accent : colors.textSecondary },
              ]}
            >
              Credit
            </Text>
          </Pressable>
        </Animated.View>

        {/* Source Selector */}
        <Animated.View entering={FadeInDown.delay(160).duration(400)}>
          <Text style={[typography.labelLarge, styles.fieldLabel, { color: colors.textSecondary }]}>
            Source
          </Text>
          <View style={styles.chipsRow}>
            {SOURCES.map(({ key, label }) => {
              const isActive = source === key;
              return (
                <Pressable
                  key={key}
                  onPress={() => setSource(key)}
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
          </View>
        </Animated.View>

        {/* Category Picker */}
        <Animated.View entering={FadeInDown.delay(240).duration(400)}>
          <Text style={[typography.labelLarge, styles.fieldLabel, { color: colors.textSecondary }]}>
            Category
          </Text>
          <Pressable
            onPress={() => setShowCategoryPicker(true)}
            style={[styles.selectBtn, { backgroundColor: colors.bgSecondary }]}
          >
            <Text
              style={[
                typography.bodyLarge,
                {
                  color: selectedCategory ? colors.textPrimary : colors.textTertiary,
                },
              ]}
            >
              {selectedCategory?.name ?? 'Select category'}
            </Text>
          </Pressable>
        </Animated.View>

        {/* Note */}
        <Animated.View entering={FadeInDown.delay(320).duration(400)}>
          <Text style={[typography.labelLarge, styles.fieldLabel, { color: colors.textSecondary }]}>
            Note (optional)
          </Text>
          <TextInput
            style={[
              typography.bodyLarge,
              styles.noteInput,
              {
                backgroundColor: colors.bgSecondary,
                color: colors.textPrimary,
              },
            ]}
            value={note}
            onChangeText={setNote}
            placeholder="Add a note..."
            placeholderTextColor={colors.textTertiary}
            multiline
          />
        </Animated.View>

        {/* Date */}
        <Animated.View entering={FadeInDown.delay(400).duration(400)}>
          <Text style={[typography.labelLarge, styles.fieldLabel, { color: colors.textSecondary }]}>
            Date
          </Text>
          <View style={[styles.selectBtn, { backgroundColor: colors.bgSecondary }]}>
            <Text style={[typography.bodyLarge, { color: colors.textPrimary }]}>
              {formatDate(Date.now())}
            </Text>
          </View>
        </Animated.View>

        {/* Save Button */}
        <Animated.View entering={FadeInDown.delay(480).duration(400)} style={styles.saveWrap}>
          <Pressable
            onPress={handleSave}
            style={({ pressed }) => [
              styles.saveBtn,
              { backgroundColor: colors.accent, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Text style={[typography.labelLarge, { color: colors.white }]}>
              Save Transaction
            </Text>
          </Pressable>
        </Animated.View>
      </ScrollView>

      {/* Category Picker Sheet */}
      {showCategoryPicker && (
        <Pressable
          style={styles.sheetOverlay}
          onPress={() => setShowCategoryPicker(false)}
        >
          <Pressable
            style={[styles.sheetContent, { backgroundColor: colors.bgSecondary }]}
            onPress={() => {}}
          >
            <Text style={[typography.titleMedium, { color: colors.textPrimary, marginBottom: spacing.md }]}>
              Pick a Category
            </Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {categories.map((cat) => (
                <Pressable
                  key={cat.id}
                  onPress={() => {
                    setCategoryId(cat.id);
                    setShowCategoryPicker(false);
                  }}
                  style={[
                    styles.catRow,
                    {
                      backgroundColor:
                        categoryId === cat.id ? colors.bgTertiary : colors.bgSecondary,
                    },
                  ]}
                >
                  <Text style={[typography.bodyLarge, { color: colors.textPrimary }]}>
                    {cat.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  amountWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.xl,
  },
  currencyPrefix: {
    fontSize: 48,
    lineHeight: 56,
  },
  amountInput: {
    fontSize: 48,
    lineHeight: 56,
    minWidth: 100,
    textAlign: 'left',
    padding: 0,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  togglePill: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.pill,
    alignItems: 'center',
  },
  fieldLabel: {
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.pill,
  },
  selectBtn: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  noteInput: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  saveWrap: {
    marginTop: spacing.md,
  },
  saveBtn: {
    width: '100%',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
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
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
});

export default AddTransactionScreen;
