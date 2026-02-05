import React, { useEffect, useState } from 'react';
import { FlatList, View, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Screen } from '../components/Screen';
import { Typography } from '../components/Typography';
import { useTheme } from '../theme';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { profileProgressService, Trophy } from '../services/profileProgressService';
import { useUserStore } from '../store/useUserStore';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

export const TrophiesScreen = () => {
  const { spacing, colors, layout } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const user = useUserStore(state => state.user);
  
  const [trophies, setTrophies] = useState<Trophy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrophies();
  }, [user]);

  const loadTrophies = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await profileProgressService.getAllTrophies(user.id);
      setTrophies(data);
    } catch (error) {
      console.error('Failed to load trophies', error);
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

  const renderItem = ({ item }: { item: Trophy }) => (
    <TouchableOpacity 
      style={[styles.itemContainer, { backgroundColor: colors.surface, borderRadius: layout.radius.md, marginBottom: spacing.md }]}
      onPress={() => navigation.navigate('TrophyDetail', { challengeId: item.challengeId })}
    >
      <View style={[styles.iconContainer, { backgroundColor: colors.background }]}>
        <Ionicons name={getIconName(item.type)} size={24} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Typography variant="label" numberOfLines={1}>
          {item.title}
        </Typography>
        <Typography variant="caption" color={colors.textSecondary}>
          {item.durationDays} {t('common.days')} • {format(new Date(item.completedAt), 'dd/MM/yyyy')}
        </Typography>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <Screen style={{ padding: spacing.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: spacing.md }}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Typography variant="h2">{t('profile.trophies')}</Typography>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} />
      ) : (
        <FlatList
          data={trophies}
          renderItem={renderItem}
          keyExtractor={item => item.challengeId}
          contentContainerStyle={{ paddingBottom: spacing.xl }}
          ListEmptyComponent={
            <Typography variant="body" align="center" color={colors.textSecondary} style={{ marginTop: spacing.xl }}>
              {t('profile.noTrophies')}
            </Typography>
          }
        />
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    // shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  }
});
