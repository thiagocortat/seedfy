import React, { useEffect, useState } from 'react';
import { View, FlatList, Share, Image, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Screen } from '../../components/Screen';
import { Typography } from '../../components/Typography';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { useTheme } from '../../theme';
import { useGroupStore } from '../../store/useGroupStore';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';

export const GroupDetailScreen = () => {
  const { groups, activity, members, fetchGroupActivity, fetchGroupMembers } = useGroupStore();
  const { spacing, colors } = useTheme();
  const route = useRoute<any>();
  const { groupId } = route.params;
  const [activeTab, setActiveTab] = useState<'feed' | 'members'>('feed');

  const group = groups.find(g => g.id === groupId);

  useEffect(() => {
    if (groupId) {
      fetchGroupActivity(groupId);
      if (activeTab === 'members') {
        fetchGroupMembers(groupId);
      }
    }
  }, [groupId, activeTab]);

  const handleInvite = async () => {
    const link = Linking.createURL(`invite/group/${groupId}`);
    await Share.share({
      message: `Join my group "${group?.name}" on Seedfy: ${link}`,
    });
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
        variant="h4" 
        color={activeTab === key ? colors.primary : colors.textSecondary}
      >
        {label}
      </Typography>
    </TouchableOpacity>
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
              {item.name || 'Unknown User'}
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
                  OWNER
                </Typography>
              </View>
            )}
          </View>
          <Typography variant="caption" color={colors.textSecondary}>
            Joined {new Date(item.joinedAt).toLocaleDateString()}
          </Typography>
        </View>
      </View>
    </Card>
  );

  return (
    <Screen style={{ padding: spacing.lg }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
        <Typography variant="h1">{group.name}</Typography>
        <Button title="Invite" onPress={handleInvite} variant="outline" style={{ minHeight: 36, paddingVertical: 4, paddingHorizontal: 12 }} />
      </View>

      <View style={{ flexDirection: 'row', marginBottom: spacing.md }}>
        {renderTab('feed', 'Activity Feed')}
        {renderTab('members', 'Members')}
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
              No activity yet.
            </Typography>
          }
        />
      ) : (
        <FlatList
          data={members}
          keyExtractor={item => item.userId}
          renderItem={renderMember}
          ListEmptyComponent={
            <Typography variant="body" color={colors.textSecondary} style={{ textAlign: 'center', marginTop: spacing.lg }}>
              No members found.
            </Typography>
          }
        />
      )}
    </Screen>
  );
};
