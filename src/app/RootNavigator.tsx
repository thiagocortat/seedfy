import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { supabase } from '../services/supabase';
import { useUserStore } from '../store/useUserStore';
import { useAuthStore } from '../store/useAuthStore';
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { OnboardingNavigator } from './OnboardingNavigator';
import { PlayerScreen } from '../screens/PlayerScreen';
import { ActivityIndicator, View } from 'react-native';
import '../i18n'; // Import i18n configuration

const Stack = createNativeStackNavigator();

export const RootNavigator = () => {
  const { user, isLoading: authLoading, setUser, setLoading: setAuthLoading } = useAuthStore();
  const { profile, isLoading: profileLoading, fetchProfile, clearProfile } = useUserStore();

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        clearProfile();
        setAuthLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        clearProfile();
      }
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (authLoading || (user && profileLoading)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : !profile?.onboardingCompleted ? (
        <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
      ) : (
        <>
          <Stack.Screen name="Main" component={MainTabNavigator} />
          <Stack.Screen 
            name="Player" 
            component={PlayerScreen} 
            options={{ 
              presentation: 'modal',
              animation: 'slide_from_bottom'
            }} 
          />
        </>
      )}
    </Stack.Navigator>
  );
};
