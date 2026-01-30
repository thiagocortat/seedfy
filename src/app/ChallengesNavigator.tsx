import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ChallengeListScreen } from '../features/challenges/ChallengeListScreen';
import { CreateChallengeScreen } from '../features/challenges/CreateChallengeScreen';
import { ChallengeDetailScreen } from '../features/challenges/ChallengeDetailScreen';
import { JourneysCatalogScreen } from '../features/journeys/JourneysCatalogScreen';
import { JourneyDetailScreen } from '../features/journeys/JourneyDetailScreen';

import { ChallengeJourneyScreen } from '../features/journeys/ChallengeJourneyScreen';
import { ChapterViewerScreen } from '../features/journeys/ChapterViewerScreen';

const Stack = createNativeStackNavigator();

export const ChallengesNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ChallengeList" component={ChallengeListScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CreateChallenge" component={CreateChallengeScreen} options={{ title: 'New Challenge' }} />
      <Stack.Screen name="ChallengeDetail" component={ChallengeDetailScreen} options={{ title: 'Challenge Detail' }} />
      <Stack.Screen name="JourneysCatalog" component={JourneysCatalogScreen} options={{ title: 'Explore Journeys' }} />
      <Stack.Screen name="JourneyDetail" component={JourneyDetailScreen} options={{ title: 'Journey Details', headerTransparent: true, headerTintColor: '#fff' }} />
      <Stack.Screen name="ChallengeJourney" component={ChallengeJourneyScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ChapterViewer" component={ChapterViewerScreen} options={{ presentation: 'modal', headerShown: false }} />
    </Stack.Navigator>
  );
};
