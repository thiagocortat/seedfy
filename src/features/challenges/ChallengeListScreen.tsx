import React, { useEffect } from 'react';
import { View, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen } from '../../components/Screen';
import { Typography } from '../../components/Typography';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { useTheme } from '../../theme';
import { useChallengeStore } from '../../store/useChallengeStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

export const ChallengeListScreen = () => {
  const { challenges, isLoading, fetchUserChallenges } = useChallengeStore();
  const user = useAuthStore(state => state.user);
  const { spacing, colors } = useTheme();
  const navigation = useNavigation<any>();
  const { t } = useTranslation();

  useEffect(() => {
    if (user) {
      fetchUserChallenges(user.id);
    }
  }, [user]);

  const activeChallenges = challenges.filter(c => c.participantStatus !== 'quit');

  return (
    <Screen style={{ padding: spacing.lg }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg }}>
        <Typography variant="h2">{t('challenges.myChallenges')}</Typography>
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <TouchableOpacity onPress={() => navigation.navigate('JourneysCatalog')}>
                <Ionicons name="compass-outline" size={28} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('CreateChallenge')}>
                <Ionicons name="add-circle" size={32} color={colors.primary} />
            </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={activeChallenges}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Card 
            onPress={() => {
                if (item.journeyId) {
                    navigation.navigate('ChallengeJourney', { challenge: item, from: 'ChallengeList' });
                } else {
                    navigation.navigate('ChallengeDetail', { challengeId: item.id });
                }
            }}
            style={{ marginBottom: spacing.md }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs }}>
               <Ionicons name="trophy" size={20} color={colors.accent} style={{ marginRight: spacing.sm }} />
               <Typography variant="h3">{item.title}</Typography>
            </View>
            <Typography variant="caption" color={colors.textSecondary}>
              {t('challenges.ends')} {new Date(item.endDate).toLocaleDateString()} • {item.durationDays} {t('common.days')}
            </Typography>
          </Card>
        )}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: spacing.xl }}>
            <Typography variant="body" color={colors.textSecondary}>
              {t('challenges.noActiveChallenges')}
            </Typography>
            <Button 
              title={t('profile.startChallenge')} 
              onPress={() => navigation.navigate('CreateChallenge')}
              variant="ghost"
              style={{ marginTop: spacing.md }}
            />
          </View>
        }
      />
    </Screen>
  );
};
