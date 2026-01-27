import React, { useEffect } from 'react';
import { View, FlatList, Alert } from 'react-native';
import { Screen } from '../../components/Screen';
import { Typography } from '../../components/Typography';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { useTheme } from '../../theme';
import { useGroupStore } from '../../store/useGroupStore';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

export const InvitationsScreen = () => {
  const { invitations, fetchInvitations, respondToInvitation, isLoading } = useGroupStore();
  const { spacing, colors } = useTheme();
  const { t } = useTranslation();

  useEffect(() => {
    fetchInvitations();
  }, []);

  const handleRespond = async (inviteId: string, accept: boolean) => {
    try {
      await respondToInvitation(inviteId, accept);
      Alert.alert(
        accept ? t('common.success') : t('common.ignored'),
        accept ? t('invitations.acceptedMessage') : t('invitations.declinedMessage')
      );
      if (accept) {
          // Ideally navigate to the group or refresh list
          fetchInvitations(); // refresh list
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('invitations.actionError'));
    }
  };

  return (
    <Screen style={{ padding: spacing.lg }}>
      <Typography variant="h2" style={{ marginBottom: spacing.lg }}>
        {t('invitations.title')}
      </Typography>

      <FlatList
        data={invitations}
        keyExtractor={item => item.id}
        refreshing={isLoading}
        onRefresh={fetchInvitations}
        renderItem={({ item }) => (
          <Card style={{ marginBottom: spacing.md, padding: spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
              <Ionicons name="mail-unread" size={24} color={colors.primary} style={{ marginRight: spacing.sm }} />
              <View style={{ flex: 1 }}>
                <Typography variant="h3">{item.groupName}</Typography>
                <Typography variant="caption" color={colors.textSecondary}>
                  {t('invitations.invitedBy')} {item.inviterName}
                </Typography>
                <Typography variant="caption" color={colors.textSecondary}>
                  {new Date(item.createdAt).toLocaleDateString()}
                </Typography>
              </View>
            </View>
            
            <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm }}>
              <Button
                title={t('common.decline', 'Decline')}
                onPress={() => handleRespond(item.id, false)}
                variant="outline"
                style={{ flex: 1, borderColor: colors.error }}
                textColor={colors.error}
              />
              <Button
                title={t('common.accept', 'Accept')}
                onPress={() => handleRespond(item.id, true)}
                style={{ flex: 1 }}
              />
            </View>
          </Card>
        )}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: spacing.xl }}>
            <Ionicons name="mail-open-outline" size={48} color={colors.textSecondary} />
            <Typography variant="body" color={colors.textSecondary} style={{ marginTop: spacing.md }}>
              {t('invitations.empty')}
            </Typography>
          </View>
        }
      />
    </Screen>
  );
};
