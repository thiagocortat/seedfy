import React, { useEffect, useState } from 'react';
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
  const { spacing, colors, layout } = useTheme();
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

  useEffect(() => {
    if (user) {
      fetchUserChallenges(user.id);
    }
  }, [user]);

  const now = new Date();

  const activeList = challenges.filter(c => 
    c.participantStatus === 'active' && new Date(c.endDate) > now
  );

  const completedList = challenges.filter(c => 
    c.participantStatus === 'quit' || 
    c.participantStatus === 'completed' || 
    (c.participantStatus === 'active' && new Date(c.endDate) <= now)
  );

  const currentList = activeTab === 'active' ? activeList : completedList;

  const renderTab = (key: 'active' | 'completed', label: string) => (
    <TouchableOpacity
      onPress={() => setActiveTab(key)}
      style={{
        flex: 1,
        paddingVertical: spacing.sm,
        backgroundColor: activeTab === key ? colors.primary : colors.surface,
        borderRadius: layout.radius.md,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: activeTab === key ? colors.primary : colors.border,
      }}
    >
      <Typography 
        variant="label" 
        color={activeTab === key ? colors.surface : colors.text}
      >
        {label}
      </Typography>
    </TouchableOpacity>
  );

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

      <View style={{ flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg }}>
        {renderTab('active', t('common.active', { defaultValue: 'Active' }))}
        {renderTab('completed', t('common.completed', { defaultValue: 'Completed' }))}
      </View>

      <FlatList
        data={currentList}
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
              {activeTab === 'active' 
                ? t('challenges.noActiveChallenges', { defaultValue: 'No active challenges' })
                : t('challenges.noCompletedChallenges', { defaultValue: 'No completed challenges' })
              }
            </Typography>
            {activeTab === 'active' && (
              <Button 
                title={t('profile.startChallenge')} 
                onPress={() => navigation.navigate('CreateChallenge')}
                variant="ghost"
                style={{ marginTop: spacing.md }}
              />
            )}
          </View>
        }
      />
    </Screen>
  );
};
