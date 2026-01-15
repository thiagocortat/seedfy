import React from 'react';
import { View, ViewStyle, SafeAreaView, StatusBar, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from '../theme';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  unsafe?: boolean;
}

export const Screen: React.FC<Props> = ({ children, style, unsafe }) => {
  const { colors } = useTheme();
  const Container = unsafe ? View : SafeAreaView;

  return (
    <Container style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={colors.background === '#1C1C1E' ? 'light-content' : 'dark-content'} />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[{ flex: 1 }, style]}
      >
        {children}
      </KeyboardAvoidingView>
    </Container>
  );
};
