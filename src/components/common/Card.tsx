import React from 'react';
import { View, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { spacing, borderRadius } from '../../constants/typography';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
}

const Card: React.FC<CardProps> = ({ children, style, onPress }) => {
  const { colors } = useTheme();

  const cardStyle: ViewStyle = {
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          cardStyle,
          pressed && styles.pressed,
          style,
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={[cardStyle, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.85,
  },
});

export default Card;
