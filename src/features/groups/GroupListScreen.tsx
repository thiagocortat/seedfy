import React, { useEffect } from 'react';
import { View, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen } from '../../components/Screen';
import { Typography } from '../../components/Typography';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { useTheme } from '../../theme';
import { useGroupStore } from '../../store/useGroupStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

export const GroupListScreen = () => {
  const { groups, isLoading, fetchUserGroups } = useGroupStore();
  const user = useAuthStore(state => state.user);
  const { spacing, colors } = useTheme();
  const navigation = useNavigation<any>();
  const { t } = useTranslation();

  useEffect(() => {
    if (user) {
      fetchUserGroups(user.id);
    }
  }, [user]);

  return (
    <Screen style={{ padding: spacing.lg }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg }}>
        <Typography variant="h2">{t('profile.myGroups')}</Typography>
        <TouchableOpacity onPress={() => navigation.navigate('CreateGroup')}>
          <Ionicons name="add-circle" size={32} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={groups}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Card 
            onPress={() => navigation.navigate('GroupDetail', { groupId: item.id })}
            style={{ marginBottom: spacing.md }}
          >
            <Typography variant="h3">{item.name}</Typography>
            <Typography variant="caption" color={colors.textSecondary}>
              {t('groups.created')} {new Date(item.createdAt).toLocaleDateString()}
            </Typography>
          </Card>
        )}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: spacing.xl }}>
            <Typography variant="body" color={colors.textSecondary}>
              {t('groups.noGroupsJoined')}
            </Typography>
            <Button 
              title={t('groups.create')}
              onPress={() => navigation.navigate('CreateGroup')}
              variant="ghost"
              style={{ marginTop: spacing.md }}
            />
          </View>
        }
      />
    </Screen>
  );
};
