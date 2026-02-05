import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card } from '../Card';
import { Typography } from '../Typography';
import { useTheme } from '../../theme';
import { useTranslation } from 'react-i18next';
import { Button } from '../Button';
import { useNavigation } from '@react-navigation/native';

interface Props {
  activeDaysTotal: number;
  streakCurrent: number;
  streakBest: number;
  isLoading?: boolean;
}

export const ConsistencyCard: React.FC<Props> = ({
  activeDaysTotal,
  streakCurrent,
  streakBest,
  isLoading
}) => {
  const { spacing, colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  if (activeDaysTotal === 0 && !isLoading) {
    return (
      <Card style={{ padding: spacing.lg }}>
        <Typography variant="h3" align="center" style={{ marginBottom: spacing.sm }}>
          {t('profile.consistency')}
        </Typography>
        <Typography variant="body" align="center" style={{ marginBottom: spacing.md, color: colors.textSecondary }}>
          Faça seu primeiro check-in e acompanhe sua constância.
        </Typography>
        <Button 
          title={t('profile.startChallenge')} 
          onPress={() => navigation.navigate('Challenges')} 
        />
      </Card>
    );
  }

  return (
    <Card style={{ padding: spacing.md }}>
      <Typography variant="h3" style={{ marginBottom: spacing.md }}>
        {t('profile.consistency')}
      </Typography>
      
      <View style={styles.row}>
        <View style={styles.item}>
          <Typography variant="h2" color={colors.primary}>
            {isLoading ? '-' : activeDaysTotal}
          </Typography>
          <Typography variant="caption" color={colors.textSecondary} align="center">
            {t('profile.activeDays')}
          </Typography>
        </View>

        <View style={styles.divider} />

        <View style={styles.item}>
          <Typography variant="h2" color={colors.accent}>
            {isLoading ? '-' : streakCurrent}
          </Typography>
          <Typography variant="caption" color={colors.textSecondary} align="center">
            {t('profile.currentStreak')}
          </Typography>
        </View>

        <View style={styles.divider} />

        <View style={styles.item}>
          <Typography variant="h2" color={colors.primary}>
            {isLoading ? '-' : streakBest}
          </Typography>
          <Typography variant="caption" color={colors.textSecondary} align="center">
            {t('profile.bestStreak')}
          </Typography>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  item: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E5EA', // using border color roughly
  }
});
