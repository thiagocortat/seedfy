import React, { useState } from 'react';
import { View, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Screen } from '../../components/Screen';
import { Typography } from '../../components/Typography';
import { useTheme } from '../../theme';
import { TodayTab } from './components/TodayTab';
import { TrailTab } from './components/TrailTab';
import { useJourneyProgress } from './hooks/useJourneyProgress';
import { Ionicons } from '@expo/vector-icons';
import { Challenge } from '../../services/challengeService';

export const ChallengeJourneyScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { challenge, from } = route.params as { challenge: Challenge; from?: string };
  const [activeTab, setActiveTab] = useState<'today' | 'trail'>('today');
  
  const { spacing, colors } = useTheme();
  const { t } = useTranslation();
  
  const progress = useJourneyProgress(challenge.startDate, challenge.durationDays);

  const handleBack = () => {
    if (from === 'ChallengeList') {
      navigation.navigate('ChallengeList');
    } else if (from === 'Home') {
      navigation.navigate('Home');
    } else {
      navigation.goBack();
    }
  };

  return (
    <Screen style={{ padding: 0 }}>
      {/* Custom Header */}
      <SafeAreaView style={{ backgroundColor: colors.surface }}>
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          padding: spacing.md, 
          borderBottomWidth: 1, 
          borderBottomColor: colors.border 
        }}>
          <TouchableOpacity onPress={handleBack} style={{ marginRight: spacing.md }}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View>
             <Typography variant="h3">{challenge.title}</Typography>
             <Typography variant="caption" color={colors.textSecondary}>
                {t('journeys.dayOf', { current: progress.dayIndex, total: challenge.durationDays })}
             </Typography>
          </View>
        </View>

        {/* Tabs */}
        <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border }}>
          <TabButton 
            title={t('journeys.today')}
            isActive={activeTab === 'today'} 
            onPress={() => setActiveTab('today')} 
          />
          <TabButton 
            title={t('journeys.trail')}
            isActive={activeTab === 'trail'} 
            onPress={() => setActiveTab('trail')} 
          />
        </View>
      </SafeAreaView>

      {/* Content */}
      <View style={{ flex: 1 }}>
        {activeTab === 'today' ? (
          <TodayTab 
            journeyId={challenge.journeyId!} 
            challengeId={challenge.id}
            dayIndex={progress.dayIndex}
          />
        ) : (
          <TrailTab 
            journeyId={challenge.journeyId!} 
            challengeId={challenge.id}
            currentDayIndex={progress.dayIndex}
          />
        )}
      </View>
    </Screen>
  );
};

const TabButton = ({ title, isActive, onPress }: any) => {
  const { colors, spacing, typography } = useTheme();
  return (
    <TouchableOpacity 
      onPress={onPress}
      style={{ 
        flex: 1, 
        paddingVertical: spacing.md, 
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: isActive ? colors.primary : 'transparent'
      }}
    >
      <Typography 
        variant="label" 
        color={isActive ? colors.primary : colors.textSecondary}
        weight="bold"
      >
        {title}
      </Typography>
    </TouchableOpacity>
  );
};
