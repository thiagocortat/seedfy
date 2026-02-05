import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '../Card';
import { Typography } from '../Typography';
import { useTheme } from '../../theme';
import { useTranslation } from 'react-i18next';
import { Trophy } from '../../services/profileProgressService';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

interface Props {
  trophies: Trophy[];
  completedTotal: number;
  onPressSeeAll: () => void;
  onPressItem: (challengeId: string) => void;
  isLoading?: boolean;
}

export const TrophiesPreviewGrid: React.FC<Props> = ({
  trophies,
  completedTotal,
  onPressSeeAll,
  onPressItem,
  isLoading
}) => {
  const { spacing, colors, layout } = useTheme();
  const { t } = useTranslation();

  const getIconName = (type: string) => {
    switch (type) {
      case 'reading': return 'book-outline';
      case 'meditation': return 'rose-outline';
      case 'fasting': return 'water-outline';
      case 'communion': return 'people-outline';
      default: return 'trophy-outline';
    }
  };

  return (
    <View style={{ marginTop: spacing.lg }}>
      <View style={styles.header}>
        <View>
          <Typography variant="h3">{t('profile.trophies')}</Typography>
          <Typography variant="caption" color={colors.textSecondary}>
            {t('profile.completedChallenges')}: {isLoading ? '-' : completedTotal}
          </Typography>
        </View>
        {completedTotal > 0 && (
          <TouchableOpacity onPress={onPressSeeAll}>
            <Typography variant="label" color={colors.accent}>
              {t('common.viewAll')}
            </Typography>
          </TouchableOpacity>
        )}
      </View>

      {trophies.length === 0 && !isLoading ? (
        <Card style={{ padding: spacing.lg, alignItems: 'center' }} variant="flat">
          <Ionicons name="trophy-outline" size={48} color={colors.secondary} style={{ marginBottom: spacing.sm }} />
          <Typography variant="body" color={colors.textSecondary} align="center">
            {t('profile.noTrophies')}
          </Typography>
        </Card>
      ) : (
        <View style={styles.grid}>
          {trophies.map((trophy) => (
            <TouchableOpacity 
              key={trophy.challengeId} 
              style={[styles.itemContainer, { backgroundColor: colors.surface, borderRadius: layout.radius.md }]}
              onPress={() => onPressItem(trophy.challengeId)}
            >
              <View style={[styles.iconContainer, { backgroundColor: colors.background }]}>
                <Ionicons name={getIconName(trophy.type)} size={24} color={colors.primary} />
              </View>
              <Typography variant="label" numberOfLines={1} style={{ marginTop: spacing.xs }}>
                {trophy.title}
              </Typography>
              <Typography variant="caption" color={colors.textSecondary}>
                {trophy.durationDays} {t('common.days')}
              </Typography>
              <Typography variant="caption" color={colors.textSecondary} style={{ fontSize: 10 }}>
                {format(new Date(trophy.completedAt), 'dd/MM/yy')}
              </Typography>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  itemContainer: {
    width: '31%', // roughly 3 columns
    padding: 12,
    alignItems: 'center',
    // shadow for card feel
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  }
});
