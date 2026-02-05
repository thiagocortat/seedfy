import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Screen } from '../components/Screen';
import { Typography } from '../components/Typography';
import { Card } from '../components/Card';
import { useTheme } from '../theme';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation } from '@react-navigation/native';
import { profileProgressService } from '../services/profileProgressService';
import { useUserStore } from '../store/useUserStore';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

export const TrophyDetailScreen = () => {
  const { spacing, colors, layout } = useTheme();
  const { t } = useTranslation();
  const route = useRoute<any>();
  const navigation = useNavigation();
  const user = useUserStore(state => state.user);
  const { challengeId } = route.params;

  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDetail();
  }, [challengeId]);

  const loadDetail = async () => {
    if (!user || !challengeId) return;
    try {
      setLoading(true);
      const data = await profileProgressService.getTrophyDetail(user.id, challengeId);
      setDetail(data);
    } catch (error) {
      console.error('Failed to load trophy detail', error);
    } finally {
      setLoading(false);
    }
  };

  const getIconName = (type: string) => {
    switch (type) {
      case 'reading': return 'book-outline';
      case 'meditation': return 'rose-outline';
      case 'fasting': return 'water-outline';
      case 'communion': return 'people-outline';
      default: return 'trophy-outline';
    }
  };

  if (loading) {
    return (
      <Screen style={{ justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </Screen>
    );
  }

  if (!detail) return null;

  const { challenge, checkins } = detail;
  const progressPercentage = Math.min(100, Math.round((checkins.length / challenge.duration_days) * 100));

  return (
    <Screen>
      <View style={styles.header}>
         <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: spacing.md }}>
            <Ionicons name="close" size={28} color={colors.text} />
         </TouchableOpacity>
         <Typography variant="h3" style={{ flex: 1, textAlign: 'center', marginRight: 40 }}>
            {t('profile.trophyDetail')}
         </Typography>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <View style={{ alignItems: 'center', marginBottom: spacing.xl }}>
          <View style={[styles.bigIconContainer, { backgroundColor: colors.accent + '20' }]}>
            <Ionicons name={getIconName(challenge.type)} size={64} color={colors.accent} />
          </View>
          <Typography variant="h2" align="center" style={{ marginTop: spacing.md }}>
            {challenge.title}
          </Typography>
          <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm }}>
            <View style={[styles.chip, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Typography variant="caption">{t(`challenges.types.${challenge.type}`) || challenge.type}</Typography>
            </View>
            <View style={[styles.chip, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Typography variant="caption">{challenge.duration_days} {t('common.days')}</Typography>
            </View>
          </View>
        </View>

        <Card style={{ marginBottom: spacing.lg }}>
            <Typography variant="h3" style={{ marginBottom: spacing.md }}>{t('profile.period')}</Typography>
            <View style={styles.row}>
                <View>
                    <Typography variant="caption" color={colors.textSecondary}>Start</Typography>
                    <Typography variant="body">{format(new Date(challenge.start_date), 'dd MMM yyyy')}</Typography>
                </View>
                <Ionicons name="arrow-forward" size={20} color={colors.textSecondary} />
                <View>
                    <Typography variant="caption" color={colors.textSecondary}>End</Typography>
                    <Typography variant="body">{format(new Date(challenge.end_date), 'dd MMM yyyy')}</Typography>
                </View>
            </View>
        </Card>

        <Card>
            <Typography variant="h3" style={{ marginBottom: spacing.md }}>{t('profile.progress')}</Typography>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: spacing.sm }}>
                <Typography variant="h1" color={colors.primary}>{checkins.length}</Typography>
                <Typography variant="body" color={colors.textSecondary}> / {challenge.duration_days}</Typography>
            </View>
            
            <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                <View style={[styles.progressFill, { width: `${progressPercentage}%`, backgroundColor: colors.success }]} />
            </View>
            
            {checkins.length > 0 && (
                 <View style={{ marginTop: spacing.md }}>
                    <Typography variant="label" style={{ marginBottom: spacing.xs }}>Check-ins</Typography>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                        {checkins.map((c: any) => (
                            <View key={c.date_key} style={{ backgroundColor: colors.background, padding: 4, borderRadius: 4 }}>
                                <Typography variant="caption">{format(new Date(c.date_key), 'dd/MM')}</Typography>
                            </View>
                        ))}
                    </View>
                 </View>
            )}
        </Card>

      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bigIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    width: '100%',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  }
});
