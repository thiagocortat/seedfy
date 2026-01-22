import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/HomeScreen';
import { ChallengesNavigator } from './ChallengesNavigator';
import { ContentScreen } from '../screens/ContentScreen';
import { ChurchNavigator } from './ChurchNavigator';
import { ProfileNavigator } from './ProfileNavigator';
import { useTheme } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

const Tab = createBottomTabNavigator();

export const MainTabNavigator = () => {
  const { colors, typography } = useTheme();
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.secondary,
        tabBarLabelStyle: {
          fontFamily: typography.fontFamily.sans,
          fontSize: 10,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Challenges') {
            iconName = focused ? 'trophy' : 'trophy-outline';
          } else if (route.name === 'Content') {
            iconName = focused ? 'play-circle' : 'play-circle-outline';
          } else if (route.name === 'Church') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: t('navigation.home') }} />
      <Tab.Screen name="Challenges" component={ChallengesNavigator} options={{ tabBarLabel: t('navigation.challenges') }} />
      <Tab.Screen name="Content" component={ContentScreen} options={{ tabBarLabel: t('navigation.library') }} />
      <Tab.Screen name="Church" component={ChurchNavigator} options={{ tabBarLabel: t('navigation.church') }} />
      <Tab.Screen name="Profile" component={ProfileNavigator} options={{ tabBarLabel: t('navigation.profile') }} />
    </Tab.Navigator>
  );
};
