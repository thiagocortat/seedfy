import React, { useEffect, useState } from 'react';
import { View, ScrollView, Image, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Screen } from '../../components/Screen';
import { Typography } from '../../components/Typography';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { useTheme } from '../../theme';
import { journeyService, JourneyTemplate } from '../../services/journeyService';
import { useChallengeStore } from '../../store/useChallengeStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useGroupStore } from '../../store/useGroupStore';
import { Ionicons } from '@expo/vector-icons';

export const JourneyDetailScreen = () => {
  const [journey, setJourney] = useState<JourneyTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  
  const { spacing, colors, layout } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { journeyId } = route.params;
  const { user } = useAuthStore();
  const { groups, fetchUserGroups } = useGroupStore();
  const createChallengeAction = useChallengeStore(state => state.createChallenge);
  const { t } = useTranslation();
  
  useEffect(() => {
    loadJourney();
    if (user) {
      fetchUserGroups(user.id);
    }
  }, [journeyId, user]);

  const loadJourney = async () => {
    try {
      setLoading(true);
      const data = await journeyService.getJourneyById(journeyId);
      setJourney(data);
      if (data && data.durationsSupported.length > 0) {
        setSelectedDuration(data.durationsSupported[0]);
      }
    } catch (error) {
      console.error('Failed to load journey details', error);
      Alert.alert(t('common.error'), t('journeys.loadError'));
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleStartJourney = async () => {
    if (!journey || !selectedDuration || !user) return;
    
    if (!selectedGroupId) {
      Alert.alert(t('common.error'), t('journeys.selectGroup'));
      return;
    }

    createChallenge(selectedGroupId);
  };

  const createChallenge = async (groupId: string) => {
    if (!journey || !selectedDuration || !user) return;

    try {
        setCreating(true);
        const newChallenge = await createChallengeAction(
            user.id,
            groupId,
            'reading', // Default type for Journeys
            journey.title,
            selectedDuration,
            new Date(),
            journey.id
        );
        
        navigation.navigate('Challenges', { 
            screen: 'ChallengeJourney', 
            params: { challenge: newChallenge, from: 'JourneyDetail' } 
        });
    } catch (error) {
        console.error(error);
        Alert.alert(t('common.error'), t('journeys.startedError'));
    } finally {
        setCreating(false);
    }
  };

  if (loading || !journey) {
    return (
      <Screen style={{ justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView>
        {journey.coverImageUrl && (
          <Image 
            source={{ uri: journey.coverImageUrl }} 
            style={{ width: '100%', height: 250, backgroundColor: colors.border }}
          />
        )}
        
        <View style={{ padding: spacing.lg }}>
          <Typography variant="h1" style={{ marginBottom: spacing.sm }}>{journey.title}</Typography>
          
          <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
             {journey.tags.map(tag => (
                 <View key={tag} style={{ backgroundColor: colors.border, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}>
                     <Typography variant="caption" color={colors.textSecondary}>#{tag}</Typography>
                 </View>
             ))}
          </View>

          <Typography variant="body" style={{ marginBottom: spacing.lg }}>
            {journey.descriptionLong || journey.descriptionShort}
          </Typography>

          <View style={{ marginBottom: spacing.xl }}>
            <Typography variant="h3" style={{ marginBottom: spacing.md }}>{t('journeys.selectDuration')}</Typography>
            <View style={{ flexDirection: 'row', gap: spacing.md }}>
                {journey.durationsSupported.map(days => (
                    <Button
                        key={days}
                        title={`${days} ${t('common.days')}`}
                        onPress={() => setSelectedDuration(days)}
                        variant={selectedDuration === days ? 'primary' : 'outline'}
                        style={{ flex: 1 }}
                    />
                ))}
            </View>
          </View>

          <View style={{ marginBottom: spacing.xl }}>
            <Typography variant="h3" style={{ marginBottom: spacing.md }}>{t('journeys.selectGroup')}</Typography>
            {groups.length > 0 ? (
              <View>
                {groups.map(g => (
                  <TouchableOpacity
                    key={g.id}
                    onPress={() => setSelectedGroupId(g.id)}
                    style={{
                      padding: spacing.md,
                      backgroundColor: selectedGroupId === g.id ? colors.primary : colors.surface,
                      borderRadius: layout.radius.md,
                      marginBottom: spacing.sm,
                      borderWidth: 1,
                      borderColor: colors.border
                    }}
                  >
                    <Typography color={selectedGroupId === g.id ? colors.surface : colors.text}>{g.name}</Typography>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Card style={{ padding: spacing.md }}>
                <Typography variant="body" color={colors.textSecondary} align="center">
                  {t('challenges.noGroups')}
                </Typography>
                <TouchableOpacity onPress={() => navigation.navigate('Profile', { screen: 'CreateGroup' })}>
                  <Typography variant="label" color={colors.primary} align="center" style={{ marginTop: spacing.xs }}>
                    {t('challenges.createGroup')}
                  </Typography>
                </TouchableOpacity>
              </Card>
            )}
          </View>

          <Button 
            title={t('journeys.start')} 
            onPress={handleStartJourney}
            loading={creating}
            style={{ marginBottom: spacing.lg }}
          />
        </View>
      </ScrollView>
    </Screen>
  );
};
