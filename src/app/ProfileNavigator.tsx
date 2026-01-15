import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileScreen } from '../screens/ProfileScreen';
import { GroupListScreen } from '../features/groups/GroupListScreen';
import { CreateGroupScreen } from '../features/groups/CreateGroupScreen';
import { GroupDetailScreen } from '../features/groups/GroupDetailScreen';
import { OnboardingChurchScreen } from '../features/onboarding/OnboardingChurchScreen';

const Stack = createNativeStackNavigator();

export const ProfileNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="GroupList" component={GroupListScreen} options={{ title: 'My Groups' }} />
      <Stack.Screen name="CreateGroup" component={CreateGroupScreen} options={{ title: 'Create Group' }} />
      <Stack.Screen name="GroupDetail" component={GroupDetailScreen} options={{ title: 'Group Detail' }} />
      <Stack.Screen name="EditChurch" component={OnboardingChurchScreen} options={{ title: 'Select Church' }} />
    </Stack.Navigator>
  );
};
