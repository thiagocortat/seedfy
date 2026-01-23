import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ChurchScreen } from '../screens/ChurchScreen';
import { OnboardingChurchScreen } from '../features/onboarding/OnboardingChurchScreen';
import { PostDetailScreen } from '../features/church/PostDetailScreen';
import { WebViewScreen } from '../features/church/WebViewScreen';
import { useTranslation } from 'react-i18next';

const Stack = createNativeStackNavigator();

export const ChurchNavigator = () => {
  const { t } = useTranslation();

  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="ChurchMain" 
        component={ChurchScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="EditChurch" 
        component={OnboardingChurchScreen} 
        options={{ title: t('church.changeChurch') || 'Select Church' }} 
      />
      <Stack.Screen 
        name="PostDetail" 
        component={PostDetailScreen} 
        options={{ title: 'Post' }} 
      />
      <Stack.Screen 
        name="WebView" 
        component={WebViewScreen} 
        options={{ title: 'Browser' }} 
      />
    </Stack.Navigator>
  );
};