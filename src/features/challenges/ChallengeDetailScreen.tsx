import React, { useEffect, useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Screen } from '../../components/Screen';
import { Typography } from '../../components/Typography';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { useTheme } from '../../theme';
import { useChallengeStore } from '../../store/useChallengeStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { Share } from 'react-native';
import { useTranslation } from 'react-i18next';

export const ChallengeDetailScreen = () => {
  const { challenges, checkIn, getDailyProgress, getUserCheckIns } = useChallengeStore();
  const [todayCount, setTodayCount] = useState(0);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [userCheckIns, setUserCheckIns] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const { spacing, colors, layout } = useTheme();
  const route = useRoute<any>();
  const user = useAuthStore(state => state.user);
  const { challengeId } = route.params;
  const { t } = useTranslation();

  const challenge = challenges.find(c => c.id === challengeId);

  useEffect(() => {
    const loadProgress = async () => {
      if (challengeId && user) {
        const count = await getDailyProgress(challengeId);
        setTodayCount(count);
        
        const checkIns = await getUserCheckIns(user.id, challengeId);
        setUserCheckIns(checkIns);
        
        const todayKey = new Date().toISOString().split('T')[0];
        setIsCheckedIn(checkIns.includes(todayKey));
      }
    };
    loadProgress();
  }, [challengeId, user]);

  const handleCheckIn = async () => {
    if (!user || !challenge) return;
    setLoading(true);
    try {
      await checkIn(user.id, challenge.id);
      
      // Update local state immediately
      const todayKey = new Date().toISOString().split('T')[0];
      setIsCheckedIn(true);
      setTodayCount(prev => prev + 1);
      setUserCheckIns(prev => [...prev, todayKey]); // <--- Fix: update userCheckIns list
      
      Alert.alert(t('challenges.greatJob'), t('challenges.dailyGoalCompleted'));
    } catch (error: any) {
      // Assuming service throws if already checked in, or we can just ignore
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    const link = Linking.createURL(`invite/challenge/${challenge?.id}`);
    await Share.share({
      message: t('challenges.inviteMessage', { title: challenge?.title, link }),
    });
  };

  if (!challenge) return null;

  return (
    <Screen style={{ padding: spacing.lg }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.lg }}>
        <View style={{ flex: 1 }}>
          <Typography variant="h1">{challenge.title}</Typography>
          <Typography variant="body" color={colors.textSecondary} style={{ textTransform: 'capitalize' }}>
            {t(`challenges.types.${challenge.type}`, { defaultValue: challenge.type })} • {challenge.durationDays} {t('common.days')}
          </Typography>
        </View>
        <Button title={t('challenges.invite')} onPress={handleInvite} variant="outline" style={{ minHeight: 36, paddingVertical: 4, paddingHorizontal: 12 }} />
      </View>

      <Card style={{ padding: spacing.lg, alignItems: 'center', marginBottom: spacing.xl, backgroundColor: colors.surface }}>
        <Typography variant="h2" color={colors.primary} style={{ fontSize: 48, lineHeight: 56 }}>
          {todayCount}
        </Typography>
        <Typography variant="body" color={colors.textSecondary}>
          {t('challenges.participantsToday')}
        </Typography>
        
        <View style={{ width: '100%', height: 1, backgroundColor: colors.border, marginVertical: spacing.lg }} />

        {isCheckedIn ? (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="checkmark-circle" size={32} color={colors.success} />
            <Typography variant="h3" style={{ marginLeft: spacing.sm }} color={colors.success}>
              {t('challenges.completed')}
            </Typography>
          </View>
        ) : (
          <Button
            title={t('challenges.markCompleted')}
            onPress={handleCheckIn}
            loading={loading}
            style={{ width: '100%' }}
          />
        )}
      </Card>

      <Typography variant="h3" style={{ marginBottom: spacing.md }}>{t('challenges.progress')}</Typography>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        {Array.from({ length: challenge.durationDays }).map((_, i) => {
           const targetDate = new Date(challenge.startDate);
           targetDate.setDate(targetDate.getDate() + i);
           const dateKey = targetDate.toISOString().split('T')[0];
           const isCompleted = userCheckIns.includes(dateKey);
           
           return (
             <View key={i} style={{ alignItems: 'center', width: '12%' }}>
               <View style={{ 
                 width: 30, 
                 height: 30, 
                 borderRadius: 15, 
                 backgroundColor: isCompleted ? colors.accent : colors.border,
                 justifyContent: 'center',
                 alignItems: 'center',
                 marginBottom: spacing.xs
               }}>
                 {isCompleted && <Ionicons name="checkmark" size={16} color="white" />}
               </View>
               <Typography variant="caption" style={{ fontSize: 10 }}>{t('challenges.day')} {i + 1}</Typography>
             </View>
           );
        })}
      </View>
    </Screen>
  );
};
