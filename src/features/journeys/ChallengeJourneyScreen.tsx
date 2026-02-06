import React, { useState } from 'react';
import { View, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Screen } from '../../components/Screen';
import { Typography } from '../../components/Typography';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { useTheme } from '../../theme';
import { TodayTab } from './components/TodayTab';
import { TrailTab } from './components/TrailTab';
import { useJourneyProgress } from './hooks/useJourneyProgress';
import { Ionicons } from '@expo/vector-icons';
import { Challenge } from '../../services/challengeService';
import { useChallengeStore } from '../../store/useChallengeStore';
import { useAuthStore } from '../../store/useAuthStore';

export const ChallengeJourneyScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { challenge: initialChallenge, from } = route.params as { challenge: Challenge; from?: string };
  
  const { user } = useAuthStore();
  const { challenges, quitChallenge, rejoinChallenge } = useChallengeStore();
  const challenge = challenges.find(c => c.id === initialChallenge.id) || initialChallenge;

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

  const handleQuit = async () => {
    if (!user || !challenge) return;
    Alert.alert(
      t('challenges.quitTitle'),
      t('challenges.quitMessage'),
      [
        { text: t('common.cancel'), style: "cancel" },
        { 
          text: t('challenges.quitConfirm'), 
          style: "destructive", 
          onPress: async () => {
            try {
                await quitChallenge(user.id, challenge.id);
                navigation.goBack();
                Alert.alert(t('challenges.quitSuccess'));
            } catch (error) {
                Alert.alert(t('common.error'), t('challenges.quitError'));
            }
          }
        }
      ]
    );
  };

  const handleRejoin = async () => {
    if (!user || !challenge) return;
    try {
        await rejoinChallenge(user.id, challenge.id);
        Alert.alert(t('common.success'), t('challenges.rejoinSuccess'));
    } catch (error) {
        Alert.alert(t('common.error'), t('challenges.rejoinError'));
    }
  };

  if (challenge.participantStatus === 'quit') {
    return (
      <Screen style={{ padding: spacing.lg }}>
        <SafeAreaView style={{ backgroundColor: colors.background }}>
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
              </View>
            </View>

            <Card style={{ padding: spacing.lg, alignItems: 'center', marginTop: spacing.xl, backgroundColor: colors.surface }}>
                <Ionicons name="exit-outline" size={48} color={colors.textSecondary} style={{ marginBottom: spacing.md }} />
                <Typography variant="h3" align="center" style={{ marginBottom: spacing.sm }}>
                    {t('challenges.quitStateTitle')}
                </Typography>
                <Typography variant="body" align="center" color={colors.textSecondary} style={{ marginBottom: spacing.lg }}>
                    {t('challenges.quitStateMessage')}
                </Typography>
                <Button 
                    title={t('challenges.rejoinAction')} 
                    onPress={handleRejoin}
                    style={{ width: '100%' }}
                />
            </Card>
        </SafeAreaView>
      </Screen>
    );
  }

  return (
    <Screen style={{ padding: 0 }}>
      {/* Custom Header */}
      <SafeAreaView style={{ backgroundColor: colors.surface }}>
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          padding: spacing.md, 
          borderBottomWidth: 1, 
          borderBottomColor: colors.border 
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
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
          
          <TouchableOpacity onPress={handleQuit} style={{ padding: 4 }}>
             <Ionicons name="ellipsis-vertical" size={24} color={colors.text} />
          </TouchableOpacity>
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
