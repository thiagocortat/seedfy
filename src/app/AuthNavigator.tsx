import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SignInScreen } from '../features/auth/SignInScreen';
import { SignUpScreen } from '../features/auth/SignUpScreen';
import { ForgotPasswordScreen } from '../features/auth/ForgotPasswordScreen';

const Stack = createNativeStackNavigator();

export const AuthNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};
