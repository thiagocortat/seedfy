import React from 'react';
import { TextInput, View, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import { Typography } from './Typography';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export const Input: React.FC<Props> = ({ 
  label, 
  error, 
  containerStyle,
  ...props 
}) => {
  const { colors, spacing, layout, typography } = useTheme();

  return (
    <View style={[styles.container, { marginBottom: spacing.md }, containerStyle]}>
      {label && (
        <Typography variant="label" style={{ marginBottom: spacing.xs }}>
          {label}
        </Typography>
      )}
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.surface,
            borderColor: error ? colors.error : colors.border,
            color: colors.text,
            borderRadius: layout.radius.md,
            padding: spacing.md,
            fontFamily: typography.fontFamily.sans,
            fontSize: typography.size.md,
          }
        ]}
        placeholderTextColor={colors.textSecondary}
        {...props}
      />
      {error && (
        <Typography variant="caption" color={colors.error} style={{ marginTop: spacing.xs }}>
          {error}
        </Typography>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  input: {
    borderWidth: 1,
    minHeight: 48,
  },
});
