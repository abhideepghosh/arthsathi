import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
  NativeModules,
  Platform,
  AppState,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { CaretRight, Trash, FileArrowUp, FileArrowDown, SunDim, Moon, Monitor } from 'phosphor-react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/navigationTypes';
import { useTheme, ThemePreference } from '../../context/ThemeContext';
import { typography, spacing, borderRadius } from '../../constants/typography';
import { getPeriodRange } from '../../utils/dateHelpers';
import { exportData, importData } from '../../services/export/ExportService';
import { deleteAllTransactions } from '../../services/db/transactionQueries';

const { NotificationAccess } = NativeModules;

const THEME_OPTIONS: { key: ThemePreference; label: string; Icon: typeof Monitor }[] = [
  { key: 'system', label: 'System', Icon: Monitor },
  { key: 'light', label: 'Light', Icon: SunDim },
  { key: 'dark', label: 'Dark', Icon: Moon },
];

type NavProp = StackNavigationProp<RootStackParamList>;

const SettingsScreen: React.FC = () => {
  const { colors, themePreference, setThemePreference } = useTheme();
  const db = useSQLiteContext();
  const navigation = useNavigation<NavProp>();

  const [notificationGranted, setNotificationGranted] = useState(false);

  const checkNotificationAccess = useCallback(async () => {
    if (Platform.OS !== 'android') {
      setNotificationGranted(false);
      return;
    }
    try {
      const enabled: boolean = await NotificationAccess.isEnabled();
      setNotificationGranted(enabled);
    } catch {
      setNotificationGranted(false);
    }
  }, []);

  useEffect(() => {
    checkNotificationAccess();
  }, [checkNotificationAccess]);

  // Re-check when app returns from settings
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        checkNotificationAccess();
      }
    });
    return () => subscription.remove();
  }, [checkNotificationAccess]);

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all transactions, budgets, and categories. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Everything',
          style: 'destructive',
          onPress: async () => {
            await deleteAllTransactions(db);
            await db.runAsync('DELETE FROM budgets');
            await db.runAsync("DELETE FROM categories WHERE is_default = 0");
            await db.runAsync("DELETE FROM app_settings WHERE key = 'is_seeded'");
            Alert.alert('Done', 'All data has been cleared.');
          },
        },
      ],
    );
  };

  const handleExport = async (periodKey: 'week' | 'month' | 'year', label: string) => {
    try {
      const { from, to } = getPeriodRange(periodKey);
      await exportData(db, from, to, label);
    } catch (err) {
      Alert.alert('Export Failed', 'Could not export data. Please try again.');
    }
  };

  const handleImport = async () => {
    try {
      const count = await importData(db);
      Alert.alert('Import Complete', `${count} transactions imported.`);
    } catch (err: unknown) {
      Alert.alert('Import Failed', err instanceof Error ? err.message : 'Could not import data.');
    }
  };

  const handleOpenNotificationSettings = async () => {
    if (Platform.OS !== 'android') {
      Alert.alert('Not Available', 'Notification access is only available on Android.');
      return;
    }
    try {
      await NotificationAccess.openSettings();
    } catch {
      Alert.alert('Error', 'Could not open notification settings.');
    }
  };

  const renderSectionHeader = (title: string, delay: number) => (
    <Animated.View entering={FadeInDown.delay(delay).duration(400)}>
      <Text
        style={[
          typography.labelLarge,
          styles.sectionHeader,
          { color: colors.textSecondary },
        ]}
      >
        {title}
      </Text>
    </Animated.View>
  );

  const renderRow = (
    label: string,
    options: {
      delay: number;
      value?: string;
      danger?: boolean;
      onPress?: () => void;
      rightElement?: React.ReactNode;
    },
  ) => {
    const { delay, value, danger, onPress, rightElement } = options;
    return (
      <Animated.View entering={FadeInDown.delay(delay).duration(400)}>
        <Pressable
          onPress={onPress}
          style={({ pressed }) => [
            styles.row,
            {
              backgroundColor: colors.bgSecondary,
              opacity: pressed && onPress ? 0.85 : 1,
            },
          ]}
        >
          <Text
            style={[
              typography.bodyLarge,
              { color: danger ? colors.danger : colors.textPrimary },
            ]}
          >
            {label}
          </Text>
          {rightElement ?? (
            <View style={styles.rowRight}>
              {value !== undefined && (
                <Text style={[typography.bodyMedium, { color: colors.textTertiary, marginRight: spacing.sm }]}>
                  {value}
                </Text>
              )}
              {onPress && <CaretRight size={18} color={colors.textTertiary} />}
            </View>
          )}
        </Pressable>
      </Animated.View>
    );
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
            Settings
          </Text>
        </Animated.View>

        {/* DATA */}
        {renderSectionHeader('DATA', 80)}

        {renderRow('Notification Access', {
          delay: 120,
          onPress: handleOpenNotificationSettings,
          rightElement: (
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: notificationGranted ? `${colors.accent}20` : colors.dangerSoft,
                },
              ]}
            >
              <Text
                style={[
                  typography.labelLarge,
                  { color: notificationGranted ? colors.accent : colors.danger },
                ]}
              >
                {notificationGranted ? 'Enabled' : 'Disabled'}
              </Text>
            </View>
          ),
        })}

        {renderRow('Clear All Data', {
          delay: 160,
          danger: true,
          onPress: handleClearData,
        })}

        {/* EXPORT */}
        {renderSectionHeader('EXPORT', 200)}

        {renderRow('Export This Week', {
          delay: 240,
          onPress: () => handleExport('week', 'ThisWeek'),
        })}

        {renderRow('Export This Month', {
          delay: 280,
          onPress: () => handleExport('month', 'ThisMonth'),
        })}

        {renderRow('Export This Year', {
          delay: 320,
          onPress: () => handleExport('year', 'ThisYear'),
        })}

        {renderRow('Import from File', {
          delay: 360,
          onPress: handleImport,
        })}

        {/* APPEARANCE */}
        {renderSectionHeader('APPEARANCE', 400)}

        <Animated.View entering={FadeInDown.delay(440).duration(400)}>
          <View style={styles.themeRow}>
            {THEME_OPTIONS.map(({ key, label, Icon }) => {
              const isActive = themePreference === key;
              return (
                <Pressable
                  key={key}
                  onPress={() => setThemePreference(key)}
                  style={[
                    styles.themeChip,
                    {
                      backgroundColor: isActive ? colors.accent : colors.bgSecondary,
                    },
                  ]}
                >
                  <Icon
                    size={18}
                    color={isActive ? colors.white : colors.textSecondary}
                    weight={isActive ? 'bold' : 'regular'}
                  />
                  <Text
                    style={[
                      typography.labelLarge,
                      { color: isActive ? colors.white : colors.textSecondary, marginLeft: spacing.xs },
                    ]}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>

        {/* ABOUT */}
        {renderSectionHeader('ABOUT', 480)}

        {renderRow('Privacy Policy', {
          delay: 520,
          onPress: () => navigation.navigate('PrivacyPolicy'),
        })}

        {renderRow('App Version', {
          delay: 560,
          value: '1.0.0',
        })}
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
  sectionHeader: {
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.pill,
  },
  themeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  themeChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
});

export default SettingsScreen;
