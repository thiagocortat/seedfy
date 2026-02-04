import React, { useEffect, useState } from 'react';
import { View, FlatList, Share, Image, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Screen } from '../../components/Screen';
import { Typography } from '../../components/Typography';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { useTheme } from '../../theme';
import { useGroupStore } from '../../store/useGroupStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useTranslation } from 'react-i18next';

export const GroupDetailScreen = () => {
  const { 
    groups, 
    activity, 
    members, 
    fetchGroupActivity, 
    fetchGroupMembers,
    pendingJoinRequests,
    fetchGroupJoinRequests,
    resolveJoinRequest
  } = useGroupStore();
  const { user } = useAuthStore();
  const { spacing, colors } = useTheme();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { groupId } = route.params;
  const [activeTab, setActiveTab] = useState<'feed' | 'members'>('feed');
  const { t } = useTranslation();

  const group = groups.find(g => g.id === groupId);
  const isOwner = group?.createdBy === user?.id;

  useEffect(() => {
    if (groupId) {
      fetchGroupActivity(groupId);
      if (activeTab === 'members') {
        fetchGroupMembers(groupId);
        if (isOwner) {
          fetchGroupJoinRequests(groupId);
        }
      }
    }
  }, [groupId, activeTab, isOwner]);

  const handleInvite = async () => {
    const link = Linking.createURL(`invite/group/${groupId}`);
    await Share.share({
      message: t('groups.inviteMessage', { name: group?.name, link }),
    });
  };

  const handleResolveRequest = async (requestId: string, action: 'approved' | 'denied') => {
    try {
      await resolveJoinRequest(requestId, action);
      Alert.alert(
        t('common.success'), 
        action === 'approved' ? t('groups.requestApproved') : t('groups.requestDenied')
      );
      if (action === 'approved') {
        fetchGroupMembers(groupId); // Refresh members list
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('groups.actionError'));
    }
  };

  if (!group) return null;

  const renderTab = (key: 'feed' | 'members', label: string) => (
    <TouchableOpacity 
      onPress={() => setActiveTab(key)}
      style={{
        flex: 1,
        paddingVertical: spacing.sm,
        borderBottomWidth: 2,
        borderBottomColor: activeTab === key ? colors.primary : 'transparent',
        alignItems: 'center'
      }}
    >
      <Typography 
        variant="h3" 
        color={activeTab === key ? colors.primary : colors.textSecondary}
      >
        {label}
      </Typography>
    </TouchableOpacity>
  );

  const renderRequest = ({ item }: { item: any }) => (
    <Card style={{ marginBottom: spacing.sm, padding: spacing.sm, borderColor: colors.secondary, borderWidth: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
        <View 
          style={{ 
            width: 40, 
            height: 40, 
            borderRadius: 20, 
            backgroundColor: colors.border, 
            marginRight: spacing.md,
            overflow: 'hidden',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          {item.requesterPhotoUrl ? (
            <Image source={{ uri: item.requesterPhotoUrl }} style={{ width: 40, height: 40 }} />
          ) : (
            <Ionicons name="person" size={20} color={colors.secondary} />
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Typography variant="body" style={{ fontWeight: 'bold' }}>
            {item.requesterName || t('common.unknownUser')}
          </Typography>
          <Typography variant="caption" color={colors.textSecondary}>
            {t('groups.wantsToJoin')} • {new Date(item.createdAt).toLocaleDateString()}
          </Typography>
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        <Button
          title={t('common.deny', 'Deny')}
          onPress={() => handleResolveRequest(item.id, 'denied')}
          variant="outline"
          style={{ flex: 1, borderColor: colors.error, minHeight: 36, paddingVertical: 4 }}
          textColor={colors.error}
        />
        <Button
          title={t('common.approve', 'Approve')}
          onPress={() => handleResolveRequest(item.id, 'approved')}
          style={{ flex: 1, minHeight: 36, paddingVertical: 4 }}
        />
      </View>
    </Card>
  );

  const renderMember = ({ item }: { item: any }) => (
    <Card style={{ marginBottom: spacing.sm, padding: spacing.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View 
          style={{ 
            width: 40, 
            height: 40, 
            borderRadius: 20, 
            backgroundColor: colors.border, 
            marginRight: spacing.md,
            overflow: 'hidden',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          {item.photoUrl ? (
            <Image source={{ uri: item.photoUrl }} style={{ width: 40, height: 40 }} />
          ) : (
            <Ionicons name="person" size={20} color={colors.secondary} />
          )}
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Typography variant="body" style={{ fontWeight: 'bold', marginRight: spacing.sm }}>
              {item.name || t('common.unknownUser')}
            </Typography>
            {item.role === 'owner' && (
              <View 
                style={{ 
                  backgroundColor: colors.primary, 
                  paddingHorizontal: 8, 
                  paddingVertical: 2, 
                  borderRadius: 12 
                }}
              >
                <Typography variant="caption" style={{ color: colors.surface, fontSize: 10 }}>
                  {t('groups.owner')}
                </Typography>
              </View>
            )}
          </View>
          <Typography variant="caption" color={colors.textSecondary}>
            {t('groups.joined')} {new Date(item.joinedAt).toLocaleDateString()}
          </Typography>
        </View>
      </View>
    </Card>
  );

  return (
    <Screen style={{ padding: spacing.lg }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
        <View style={{ flex: 1, marginRight: spacing.md }}>
          <Typography variant="h1">{group.name}</Typography>
        </View>
        <View style={{ flexDirection: 'row', flexShrink: 0 }}>
          {isOwner && (
            <Button 
              title={t('common.edit')} 
              onPress={() => navigation.navigate('EditGroup', { groupId })} 
              variant="ghost" 
              style={{ minHeight: 36, paddingVertical: 4, paddingHorizontal: 12, marginRight: spacing.sm }} 
            />
          )}
          <Button title={t('groups.invite')} onPress={handleInvite} variant="outline" style={{ minHeight: 36, paddingVertical: 4, paddingHorizontal: 12 }} />
        </View>
      </View>

      <View style={{ flexDirection: 'row', marginBottom: spacing.md }}>
        {renderTab('feed', t('groups.activityFeed'))}
        {renderTab('members', t('groups.members'))}
      </View>
      
      {activeTab === 'feed' ? (
        <FlatList
          data={activity}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <Card style={{ marginBottom: spacing.sm, padding: spacing.sm }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons 
                  name={item.type === 'joined' ? 'person-add' : 'checkmark-circle'} 
                  size={20} 
                  color={colors.secondary}
                  style={{ marginRight: spacing.sm }} 
                />
                <View>
                  <Typography variant="body">{item.message}</Typography>
                  <Typography variant="caption" color={colors.textSecondary}>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </Typography>
                </View>
              </View>
            </Card>
          )}
          ListEmptyComponent={
            <Typography variant="body" color={colors.textSecondary} style={{ textAlign: 'center', marginTop: spacing.lg }}>
              {t('groups.noActivity')}
            </Typography>
          }
        />
      ) : (
        <FlatList
          data={members}
          keyExtractor={item => item.userId}
          ListHeaderComponent={
            <>
              {isOwner && (
                <View style={{ marginBottom: spacing.lg }}>
                  <Button
                    title={t('groups.inviteMember', 'Invite Member')}
                    onPress={() => navigation.navigate('GroupInvite', { groupId })}
                    style={{ marginBottom: spacing.md }}
                    variant="outline"
                  />
                  
                  {pendingJoinRequests.length > 0 && (
                    <View style={{ marginBottom: spacing.md }}>
                      <Typography variant="h3" style={{ marginBottom: spacing.sm }}>
                        {t('groups.pendingRequests', 'Pending Requests')} ({pendingJoinRequests.length})
                      </Typography>
                      {pendingJoinRequests.map(req => (
                        <View key={req.id}>
                          {renderRequest({ item: req })}
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              )}
            </>
          }
          renderItem={renderMember}
          ListEmptyComponent={
            <Typography variant="body" color={colors.textSecondary} style={{ textAlign: 'center', marginTop: spacing.lg }}>
              {t('groups.noMembers')}
            </Typography>
          }
        />
      )}
    </Screen>
  );
};
