import { TextStyle } from 'react-native';

export const typography: Record<string, TextStyle> = {
  displayLarge: { fontFamily: 'Sora_700Bold', fontSize: 40, lineHeight: 48 },
  displayMedium: { fontFamily: 'Sora_600SemiBold', fontSize: 28, lineHeight: 36 },
  titleLarge: { fontFamily: 'Sora_600SemiBold', fontSize: 22, lineHeight: 30 },
  titleMedium: { fontFamily: 'Sora_500Medium', fontSize: 18, lineHeight: 26 },
  bodyLarge: { fontFamily: 'DMSans_400Regular', fontSize: 16, lineHeight: 24 },
  bodyMedium: { fontFamily: 'DMSans_400Regular', fontSize: 14, lineHeight: 20 },
  labelLarge: { fontFamily: 'DMSans_500Medium', fontSize: 14, lineHeight: 20 },
  monoAmount: { fontFamily: 'DMMono_500Medium', fontSize: 16, lineHeight: 24 },
  monoAmountLg: { fontFamily: 'DMMono_500Medium', fontSize: 32, lineHeight: 40 },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 100,
} as const;
