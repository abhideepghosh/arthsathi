import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Question } from 'phosphor-react-native';
import { useTheme } from '../../context/ThemeContext';
import { typography, spacing } from '../../constants/typography';

interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, subtitle }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Question size={48} color={colors.textTertiary} weight="light" />
      <Text
        style={[
          typography.titleMedium,
          styles.title,
          { color: colors.textPrimary },
        ]}
      >
        {title}
      </Text>
      {subtitle ? (
        <Text
          style={[
            typography.bodyMedium,
            styles.subtitle,
            { color: colors.textSecondary },
          ]}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  title: {
    marginTop: spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});

export default EmptyState;
