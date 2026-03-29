import React from 'react';
import { Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { ArrowLeft } from 'phosphor-react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { typography, spacing, borderRadius } from '../../constants/typography';

const SECTIONS = [
  {
    title: 'What We Collect',
    body:
      'ArthSaathi reads incoming financial notifications from your default messaging app to automatically detect transactions such as UPI payments, bank transfers, and card transactions. Only the transaction amount, merchant name, bank name, and last 4 digits of your account number are extracted. The notification text is stored locally for deduplication.\n\nAll data collected by ArthSaathi is stored exclusively on your device. No information is transmitted to, stored on, or processed by any external server, cloud infrastructure, or remote database. ArthSaathi does not collect, upload, or share any user data for analytics, advertising, research, or any other purpose whatsoever. Your financial information remains entirely within your control on your personal device at all times.',
  },
  {
    title: 'Why We Collect It',
    body:
      'The sole purpose is to help you track your expenses and income automatically without manual data entry. ArthSaathi is an offline expense tracker that parses financial notifications to give you spending insights, budget tracking, and transaction history.',
  },
  {
    title: 'Where Data Is Stored',
    body:
      'All data is stored exclusively on your device in a local SQLite database. No data is ever sent to any server, cloud service, or third party. ArthSaathi works entirely offline.',
  },
  {
    title: 'Data Sharing',
    body:
      'ArthSaathi does not share your data with anyone. There are no analytics, no ads, no tracking, and no third-party SDKs that collect data. Your financial information stays on your device.',
  },
  {
    title: 'Notification Access',
    body:
      'ArthSaathi uses Android\'s Notification Listener Service to read financial notifications from your messaging app. This requires you to enable notification access for ArthSaathi in your device Settings > Notifications > Notification access. ArthSaathi only processes notifications from messaging apps and ignores all other notifications. You can revoke this access at any time through the same Settings page. The app will continue to work for manual transaction entry without notification access.',
  },
  {
    title: 'Data Deletion',
    body:
      'You can delete all your data at any time from Settings > Clear All Data. You can also delete individual transactions. Uninstalling the app removes all stored data permanently.',
  },
  {
    title: 'Contact',
    body:
      'If you have questions about this privacy policy or your data, please contact us via the app store listing.',
  },
] as const;

const PrivacyPolicyScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bgPrimary }]}>
      <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={[typography.titleLarge, { color: colors.textPrimary }]}>
          Privacy Policy
        </Text>
      </Animated.View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.Text
          entering={FadeInDown.delay(80).duration(400)}
          style={[typography.bodyMedium, { color: colors.textSecondary, marginBottom: spacing.lg }]}
        >
          Last updated: March 2026
        </Animated.Text>

        {SECTIONS.map(({ title, body }, index) => (
          <Animated.View
            key={title}
            entering={FadeInDown.delay(120 + index * 60).duration(400)}
            style={[styles.section, { backgroundColor: colors.bgSecondary }]}
          >
            <Text style={[typography.titleMedium, { color: colors.textPrimary, marginBottom: spacing.sm }]}>
              {title}
            </Text>
            <Text style={[typography.bodyMedium, { color: colors.textSecondary, lineHeight: 22 }]}>
              {body}
            </Text>
          </Animated.View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  backBtn: {
    padding: spacing.xs,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  section: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
});

export default PrivacyPolicyScreen;
