import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ChallengeListScreen } from '../features/challenges/ChallengeListScreen';
import { CreateChallengeScreen } from '../features/challenges/CreateChallengeScreen';
import { ChallengeDetailScreen } from '../features/challenges/ChallengeDetailScreen';

const Stack = createNativeStackNavigator();

export const ChallengesNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ChallengeList" component={ChallengeListScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CreateChallenge" component={CreateChallengeScreen} options={{ title: 'New Challenge' }} />
      <Stack.Screen name="ChallengeDetail" component={ChallengeDetailScreen} options={{ title: 'Challenge Detail' }} />
    </Stack.Navigator>
  );
};
