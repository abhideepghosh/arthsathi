import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { typography, spacing, borderRadius } from '../../constants/typography';

interface CategoryBadgeProps {
  name: string;
  color: string;
  icon?: string;
}

const CategoryBadge: React.FC<CategoryBadgeProps> = ({ name, color }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.bgTertiary }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[typography.bodyMedium, { color: colors.textPrimary }]}>
        {name}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
});

export default CategoryBadge;
