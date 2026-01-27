import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileScreen } from '../screens/ProfileScreen';
import { GroupListScreen } from '../features/groups/GroupListScreen';
import { CreateGroupScreen } from '../features/groups/CreateGroupScreen';
import { GroupDetailScreen } from '../features/groups/GroupDetailScreen';
import { OnboardingChurchScreen } from '../features/onboarding/OnboardingChurchScreen';
import { GroupInviteScreen } from '../features/groups/GroupInviteScreen';
import { InvitationsScreen } from '../features/groups/InvitationsScreen';
import { useTranslation } from 'react-i18next';

const Stack = createNativeStackNavigator();

export const ProfileNavigator = () => {
  const { t } = useTranslation();
  return (
    <Stack.Navigator>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="GroupList" component={GroupListScreen} options={{ title: t('profile.myGroups') || 'My Groups' }} />
      <Stack.Screen name="CreateGroup" component={CreateGroupScreen} options={{ title: t('groups.create') || 'Create Group' }} />
      <Stack.Screen name="GroupDetail" component={GroupDetailScreen} options={{ title: t('groups.detail') || 'Group Detail' }} />
      <Stack.Screen name="EditChurch" component={OnboardingChurchScreen} options={{ title: t('church.select') || 'Select Church' }} />
      <Stack.Screen name="GroupInvite" component={GroupInviteScreen} options={{ title: t('groups.inviteMember') || 'Invite Member' }} />
      <Stack.Screen name="Invitations" component={InvitationsScreen} options={{ title: t('invitations.title') || 'Invitations' }} />
    </Stack.Navigator>
  );
};
