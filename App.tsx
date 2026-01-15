import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RootNavigator } from './src/app/RootNavigator';
import { StatusBar } from 'expo-status-bar';

const queryClient = new QueryClient();

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>
          <RootNavigator />
          <StatusBar style="auto" />
        </NavigationContainer>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
