import React, { useState, useEffect } from 'react';
import { View, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen } from '../../components/Screen';
import { Typography } from '../../components/Typography';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { useTheme } from '../../theme';
import { useGroupStore } from '../../store/useGroupStore';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Group } from '../../services/groupService';

export const ExploreGroupsScreen = () => {
  const { 
    searchedGroups, 
    isLoading, 
    searchGroups, 
    clearGroupSearch, 
    requestToJoinGroup, 
    myJoinRequests, 
    fetchMyJoinRequests,
    groups: myGroups
  } = useGroupStore();
  
  const [query, setQuery] = useState('');
  const { spacing, colors, layout } = useTheme();
  const navigation = useNavigation<any>();
  const { t } = useTranslation();

  useEffect(() => {
    // Initial fetch of my requests to know status
    fetchMyJoinRequests();
    return () => {
      clearGroupSearch();
    };
  }, []);

  const handleSearch = () => {
    if (query.trim().length > 0) {
      searchGroups(query);
    }
  };

  const handleRequestJoin = async (group: Group) => {
    try {
      await requestToJoinGroup(group.id);
      Alert.alert(t('common.success'), t('groups.requestSent'));
    } catch (error) {
      Alert.alert(t('common.error'), t('groups.requestFailed'));
    }
  };

  const getGroupStatus = (groupId: string) => {
    // Check if already a member
    if (myGroups.some(g => g.id === groupId)) return 'member';
    
    // Check pending request
    const request = myJoinRequests.find(r => r.groupId === groupId && r.status === 'pending');
    if (request) return 'pending';

    // Check denied request (optional, could show denied state)
    const denied = myJoinRequests.find(r => r.groupId === groupId && r.status === 'denied');
    if (denied) return 'denied';

    return 'none';
  };

  const renderItem = ({ item }: { item: Group }) => {
    const status = getGroupStatus(item.id);

    return (
      <Card style={{ marginBottom: spacing.md }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Typography variant="h3">{item.name}</Typography>
            <Typography variant="caption" color={colors.textSecondary}>
              {t('groups.created')} {new Date(item.createdAt).toLocaleDateString()}
            </Typography>
          </View>
          
          <View>
            {status === 'member' && (
              <Button 
                title={t('groups.open')} 
                variant="outline"
                size="small"
                onPress={() => navigation.navigate('GroupDetail', { groupId: item.id })}
              />
            )}
            {status === 'pending' && (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="time-outline" size={16} color={colors.secondary} style={{ marginRight: 4 }} />
                <Typography variant="caption" color={colors.secondary}>{t('groups.pending')}</Typography>
              </View>
            )}
            {status === 'denied' && (
              <Typography variant="caption" color={colors.error}>{t('groups.denied')}</Typography>
            )}
            {status === 'none' && (
              <Button 
                title={t('groups.join')} 
                size="small"
                onPress={() => handleRequestJoin(item)}
              />
            )}
          </View>
        </View>
      </Card>
    );
  };

  return (
    <Screen style={{ padding: spacing.lg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: spacing.md }}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Typography variant="h2">{t('groups.explore')}</Typography>
      </View>

      <View style={{ flexDirection: 'row', marginBottom: spacing.lg }}>
        <TextInput
          style={{
            flex: 1,
            backgroundColor: colors.surface,
            borderRadius: layout.radius.md,
            padding: spacing.md,
            marginRight: spacing.sm,
            color: colors.text,
            borderWidth: 1,
            borderColor: colors.border
          }}
          placeholder={t('groups.searchPlaceholder')}
          placeholderTextColor={colors.textSecondary}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
        />
        <Button 
          title={t('common.search')} 
          onPress={handleSearch}
          disabled={isLoading}
        />
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        <FlatList
          data={searchedGroups}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: spacing.xl }}>
              <Typography variant="body" color={colors.textSecondary}>
                {searchedGroups.length === 0 && query.length > 0 
                  ? t('groups.noResults') 
                  : t('groups.searchPrompt')}
              </Typography>
            </View>
          }
        />
      )}
    </Screen>
  );
};
