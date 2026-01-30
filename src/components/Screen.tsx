import React from 'react';
import { View, ViewStyle, StatusBar, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  unsafe?: boolean;
}

export const Screen: React.FC<Props> = ({ children, style, unsafe }) => {
  const { colors } = useTheme();
  
  if (unsafe) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar barStyle={colors.background === '#1C1C1E' ? 'light-content' : 'dark-content'} />
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={[{ flex: 1 }, style]}
        >
          {children}
        </KeyboardAvoidingView>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'left', 'right']}>
      <StatusBar barStyle={colors.background === '#1C1C1E' ? 'light-content' : 'dark-content'} />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[{ flex: 1 }, style]}
      >
        {children}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
