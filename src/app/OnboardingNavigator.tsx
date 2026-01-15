import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingProfileScreen } from '../features/onboarding/OnboardingProfileScreen';
import { OnboardingChurchScreen } from '../features/onboarding/OnboardingChurchScreen';
import { OnboardingInterestsScreen } from '../features/onboarding/OnboardingInterestsScreen';
import { OnboardingNotificationsScreen } from '../features/onboarding/OnboardingNotificationsScreen';

const Stack = createNativeStackNavigator();

export const OnboardingNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OnboardingProfile" component={OnboardingProfileScreen} />
      <Stack.Screen name="OnboardingChurch" component={OnboardingChurchScreen} />
      <Stack.Screen name="OnboardingInterests" component={OnboardingInterestsScreen} />
      <Stack.Screen name="OnboardingNotifications" component={OnboardingNotificationsScreen} />
    </Stack.Navigator>
  );
};
