import React from 'react';
import { View, Text, Pressable, StyleSheet, NativeModules, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { ShieldCheck, Lock, Bell, X } from 'phosphor-react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/navigationTypes';
import { useTheme } from '../../context/ThemeContext';
import { typography, spacing, borderRadius } from '../../constants/typography';

const { NotificationAccess } = NativeModules;

type NavProp = StackNavigationProp<RootStackParamList>;

const BULLETS = [
  {
    Icon: Bell,
    text: 'Reads financial notifications from your messaging app to auto-detect transactions like UPI payments, transfers, and card spends.',
  },
  {
    Icon: Lock,
    text: 'All data stays on your device. Nothing is ever sent to any server or third party.',
  },
  {
    Icon: X,
    text: 'No ads, no tracking, no analytics. You can revoke notification access anytime in your device Settings.',
  },
] as const;

const PrivacyScreen: React.FC = () => {
  const { colors } = useTheme();
  const db = useSQLiteContext();
  const navigation = useNavigation<NavProp>();

  const handleContinue = async () => {
    // Open notification listener settings so user can enable the service
    if (Platform.OS === 'android') {
      try {
        await NotificationAccess.openSettings();
      } catch {
        // Settings may not open on some devices — continue anyway
      }
    }

    await db.runAsync(
      `INSERT OR REPLACE INTO app_settings (key, value) VALUES ('has_seen_privacy', '1')`,
    );
    navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      <View style={styles.content}>
        <Animated.View entering={FadeInUp.delay(0).duration(500)} style={styles.iconWrap}>
          <ShieldCheck size={80} color={colors.accent} weight="duotone" />
        </Animated.View>

        <Animated.Text
          entering={FadeInUp.delay(80).duration(500)}
          style={[typography.displayMedium, styles.headline, { color: colors.textPrimary }]}
        >
          Your money.{'\n'}Your device.{'\n'}Your privacy.
        </Animated.Text>

        <View style={styles.bullets}>
          {BULLETS.map(({ Icon, text }, index) => (
            <Animated.View
              key={index}
              entering={FadeInUp.delay(160 + index * 80).duration(500)}
              style={styles.bulletRow}
            >
              <Icon size={24} color={colors.accent} weight="bold" />
              <Text style={[typography.bodyLarge, styles.bulletText, { color: colors.textPrimary }]}>
                {text}
              </Text>
            </Animated.View>
          ))}
        </View>

        <Animated.Text
          entering={FadeInUp.delay(480).duration(500)}
          style={[typography.bodyMedium, styles.subtext, { color: colors.textSecondary }]}
        >
          ArthSaathi works entirely offline. Your financial data never leaves your phone. On the next screen, enable notification access for ArthSaathi.
        </Animated.Text>

        <Animated.View entering={FadeInUp.delay(560).duration(500)} style={styles.ctaWrap}>
          <Pressable
            onPress={handleContinue}
            style={({ pressed }) => [
              styles.ctaButton,
              { backgroundColor: colors.accent, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Text style={[typography.labelLarge, { color: colors.white }]}>
              Enable notification access
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: spacing.lg,
    width: '100%',
    alignItems: 'center',
  },
  iconWrap: {
    marginBottom: spacing.lg,
  },
  headline: {
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  bullets: {
    width: '100%',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  bulletText: {
    flex: 1,
  },
  subtext: {
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  ctaWrap: {
    width: '100%',
  },
  ctaButton: {
    width: '100%',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PrivacyScreen;
