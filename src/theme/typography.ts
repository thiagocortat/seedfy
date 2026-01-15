import { Platform } from 'react-native';

export const typography = {
  fontFamily: {
    serif: Platform.select({ ios: 'Georgia', android: 'serif' }), // Fallback for MVP
    sans: Platform.select({ ios: 'System', android: 'Roboto' }),
  },
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
  weight: {
    regular: '400',
    medium: '500',
    bold: '700',
  } as const,
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};
