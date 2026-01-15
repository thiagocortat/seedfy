import React from 'react';
import { TouchableOpacity, ActivityIndicator, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../theme';
import { Typography } from './Typography';

interface Props {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export const Button: React.FC<Props> = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  loading = false, 
  disabled = false,
  style 
}) => {
  const { colors, spacing, layout } = useTheme();

  const getBackgroundColor = () => {
    if (disabled) return colors.secondary;
    switch (variant) {
      case 'primary': return colors.primary;
      case 'secondary': return colors.surface;
      case 'outline': return 'transparent';
      case 'ghost': return 'transparent';
      default: return colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return colors.surface;
    switch (variant) {
      case 'primary': return colors.surface;
      case 'secondary': return colors.text;
      case 'outline': return colors.primary;
      case 'ghost': return colors.textSecondary;
      default: return colors.surface;
    }
  };

  const getBorder = () => {
    if (variant === 'outline') return { borderWidth: 1, borderColor: colors.primary };
    return {};
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.container,
        { 
          backgroundColor: getBackgroundColor(),
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.lg,
          borderRadius: layout.radius.lg,
          ...getBorder(),
        },
        style
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Typography 
          variant="label" 
          weight="bold" 
          color={getTextColor()}
          style={{ textTransform: 'uppercase', letterSpacing: 1 }}
        >
          {title}
        </Typography>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
});
