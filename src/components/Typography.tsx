import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import { useTheme } from '../theme';

interface Props extends TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'label';
  color?: string;
  weight?: 'regular' | 'medium' | 'bold';
  align?: TextStyle['textAlign'];
}

export const Typography: React.FC<Props> = ({ 
  variant = 'body', 
  color, 
  weight, 
  align,
  style, 
  children, 
  ...props 
}) => {
  const { colors, typography } = useTheme();

  const getStyle = (): TextStyle => {
    switch (variant) {
      case 'h1':
        return {
          fontFamily: typography.fontFamily.serif,
          fontSize: typography.size.xxl,
          fontWeight: typography.weight.bold,
          lineHeight: typography.size.xxl * typography.lineHeight.tight,
        };
      case 'h2':
        return {
          fontFamily: typography.fontFamily.serif,
          fontSize: typography.size.xl,
          fontWeight: typography.weight.bold,
          lineHeight: typography.size.xl * typography.lineHeight.tight,
        };
      case 'h3':
        return {
          fontFamily: typography.fontFamily.serif,
          fontSize: typography.size.lg,
          fontWeight: typography.weight.medium,
          lineHeight: typography.size.lg * typography.lineHeight.normal,
        };
      case 'caption':
        return {
          fontFamily: typography.fontFamily.sans,
          fontSize: typography.size.xs,
          lineHeight: typography.size.xs * typography.lineHeight.normal,
        };
      case 'label':
        return {
          fontFamily: typography.fontFamily.sans,
          fontSize: typography.size.sm,
          fontWeight: typography.weight.medium,
          lineHeight: typography.size.sm * typography.lineHeight.normal,
        };
      default: // body
        return {
          fontFamily: typography.fontFamily.sans,
          fontSize: typography.size.md,
          lineHeight: typography.size.md * typography.lineHeight.relaxed,
        };
    }
  };

  return (
    <Text 
      style={[
        getStyle(),
        { color: color || colors.text, textAlign: align },
        weight && { fontWeight: typography.weight[weight] },
        style
      ]} 
      {...props}
    >
      {children}
    </Text>
  );
};
