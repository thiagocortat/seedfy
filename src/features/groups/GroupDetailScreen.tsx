import React, { useEffect } from 'react';
import { View, FlatList, Share } from 'react-native';
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
  const { groups, activity, fetchGroupActivity } = useGroupStore();
  const { spacing, colors } = useTheme();
  const route = useRoute<any>();
  const { groupId } = route.params;

  const group = groups.find(g => g.id === groupId);

  useEffect(() => {
    if (groupId) {
      fetchGroupActivity(groupId);
    }
  }, [groupId]);

  const handleInvite = async () => {
    const link = Linking.createURL(`invite/group/${groupId}`);
    await Share.share({
      message: `Join my group "${group?.name}" on Seedfy: ${link}`,
    });
  };

  if (!group) return null;

  return (
    <Screen style={{ padding: spacing.lg }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
        <Typography variant="h1">{group.name}</Typography>
        <Button title="Invite" onPress={handleInvite} variant="outline" style={{ minHeight: 36, paddingVertical: 4, paddingHorizontal: 12 }} />
      </View>

      <Typography variant="h3" style={{ marginBottom: spacing.sm }}>Activity Feed</Typography>
      
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
    </Screen>
  );
};
