import React from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Warning } from 'phosphor-react-native';
import { useTheme } from '../../context/ThemeContext';
import { typography, spacing, borderRadius } from '../../constants/typography';

interface WarningBannerProps {
  message: string;
  type?: 'warning' | 'danger';
}

const WarningBanner: React.FC<WarningBannerProps> = ({
  message,
  type = 'warning',
}) => {
  const { colors } = useTheme();

  const backgroundColor = type === 'danger' ? colors.dangerSoft : colors.amber + '20';
  const iconColor = type === 'danger' ? colors.danger : colors.amber;

  return (
    <Animated.View
      entering={FadeInDown}
      style={[
        styles.container,
        { backgroundColor },
      ]}
    >
      <Warning size={20} color={iconColor} weight="fill" />
      <Text
        style={[
          typography.bodyMedium,
          styles.message,
          { color: colors.textPrimary },
        ]}
      >
        {message}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderRadius: borderRadius.md,
    padding: spacing.sm,
  },
  message: {
    flex: 1,
    marginLeft: spacing.sm,
  },
});

export default WarningBanner;
