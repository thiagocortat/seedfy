import React, { useEffect, useState } from 'react';
import { View, FlatList, Alert, TouchableOpacity } from 'react-native';
import { Screen } from '../../components/Screen';
import { Typography } from '../../components/Typography';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { useTheme } from '../../theme';
import { useGroupStore } from '../../store/useGroupStore';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

type Tab = 'invitations' | 'requests';

export const InvitationsScreen = () => {
  const { 
    invitations, 
    fetchInvitations, 
    respondToInvitation, 
    isLoading,
    myJoinRequests,
    fetchMyJoinRequests,
    cancelJoinRequest
  } = useGroupStore();
  const { spacing, colors } = useTheme();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('invitations');

  useEffect(() => {
    fetchInvitations();
    fetchMyJoinRequests();
  }, []);

  const handleRefresh = () => {
    if (activeTab === 'invitations') {
      fetchInvitations();
    } else {
      fetchMyJoinRequests();
    }
  };

  const handleRespond = async (inviteId: string, accept: boolean) => {
    try {
      await respondToInvitation(inviteId, accept);
      Alert.alert(
        accept ? t('common.success') : t('common.ignored'),
        accept ? t('invitations.acceptedMessage') : t('invitations.declinedMessage')
      );
      if (accept) {
          fetchInvitations(); 
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('invitations.actionError'));
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    try {
      await cancelJoinRequest(requestId);
      Alert.alert(t('common.success'), t('groups.requestCanceled'));
    } catch (error) {
      Alert.alert(t('common.error'), t('groups.actionError'));
    }
  };

  const renderTab = (tab: Tab, label: string) => (
    <TouchableOpacity 
      onPress={() => setActiveTab(tab)}
      style={{
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderBottomWidth: 2,
        borderBottomColor: activeTab === tab ? colors.primary : 'transparent',
        flex: 1,
        alignItems: 'center'
      }}
    >
      <Typography 
        variant="label" 
        color={activeTab === tab ? colors.primary : colors.textSecondary}
      >
        {label}
      </Typography>
    </TouchableOpacity>
  );

  const renderInvitationItem = ({ item }: { item: any }) => (
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
  );

  const renderRequestItem = ({ item }: { item: any }) => (
    <Card style={{ marginBottom: spacing.md, padding: spacing.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
        <Ionicons 
          name={item.status === 'pending' ? 'time' : item.status === 'denied' ? 'close-circle' : 'checkmark-circle'} 
          size={24} 
          color={item.status === 'pending' ? colors.secondary : item.status === 'denied' ? colors.error : colors.success} 
          style={{ marginRight: spacing.sm }} 
        />
        <View style={{ flex: 1 }}>
          <Typography variant="h3">{item.groupName}</Typography>
          <Typography variant="caption" color={colors.textSecondary}>
             {t('groups.status')}: {t(`groups.${item.status}`, item.status)}
          </Typography>
          <Typography variant="caption" color={colors.textSecondary}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Typography>
        </View>
      </View>
      
      {item.status === 'pending' && (
        <Button
          title={t('common.cancel', 'Cancel')}
          onPress={() => handleCancelRequest(item.id)}
          variant="outline"
          size="small"
          style={{ borderColor: colors.textSecondary, alignSelf: 'flex-start', marginTop: spacing.sm }}
          textColor={colors.textSecondary}
        />
      )}
    </Card>
  );

  return (
    <Screen style={{ padding: spacing.lg }}>
      <Typography variant="h2" style={{ marginBottom: spacing.lg }}>
        {t('invitations.title')}
      </Typography>

      <View style={{ flexDirection: 'row', marginBottom: spacing.lg }}>
        {renderTab('invitations', t('invitations.tabReceived', 'Received'))}
        {renderTab('requests', t('invitations.tabSent', 'Sent'))}
      </View>

      <FlatList
        data={activeTab === 'invitations' ? invitations : myJoinRequests}
        keyExtractor={item => item.id}
        refreshing={isLoading}
        onRefresh={handleRefresh}
        renderItem={activeTab === 'invitations' ? renderInvitationItem : renderRequestItem}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: spacing.xl }}>
            <Ionicons name={activeTab === 'invitations' ? "mail-open-outline" : "paper-plane-outline"} size={48} color={colors.textSecondary} />
            <Typography variant="body" color={colors.textSecondary} style={{ marginTop: spacing.md }}>
              {activeTab === 'invitations' ? t('invitations.empty') : t('groups.noRequests')}
            </Typography>
          </View>
        }
      />
    </Screen>
  );
};
