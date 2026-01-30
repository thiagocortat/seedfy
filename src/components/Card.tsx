import React from 'react';
import { View, ViewStyle, TouchableOpacity, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme';

interface Props {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  variant?: 'elevated' | 'flat' | 'outlined';
}

export const Card: React.FC<Props> = ({ 
  children, 
  onPress, 
  style, 
  variant = 'elevated' 
}) => {
  const { colors, layout, spacing } = useTheme();

  const containerStyle: ViewStyle = {
    backgroundColor: colors.surface,
    borderRadius: layout.radius.lg,
    // @ts-ignore
    cornerCurve: 'continuous',
    padding: spacing.md,
    ...(variant === 'elevated' ? layout.shadow.sm : {}),
    ...(variant === 'outlined' ? { borderWidth: 1, borderColor: colors.border } : {}),
  };

  if (onPress) {
    return (
      <TouchableOpacity 
        onPress={() => {
          if (Platform.OS === 'ios') {
            Haptics.selectionAsync();
          }
          onPress();
        }} 
        style={[containerStyle, style]} 
        activeOpacity={0.8}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[containerStyle, style]}>
      {children}
    </View>
  );
};
