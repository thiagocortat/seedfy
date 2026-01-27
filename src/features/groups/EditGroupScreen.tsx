import React, { useState, useEffect } from 'react';
import { View, Alert, Switch, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Screen } from '../../components/Screen';
import { Typography } from '../../components/Typography';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { useTheme } from '../../theme';
import { useGroupStore } from '../../store/useGroupStore';
import { useTranslation } from 'react-i18next';

export const EditGroupScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { groupId } = route.params;
  const { groups, updateGroup } = useGroupStore();
  const group = groups.find(g => g.id === groupId);
  
  const [name, setName] = useState(group?.name || '');
  const [discoverable, setDiscoverable] = useState(group?.discoverable || false);
  const [joinPolicy, setJoinPolicy] = useState<'request_to_join' | 'invite_only'>(group?.joinPolicy || 'invite_only');
  const [loading, setLoading] = useState(false);
  
  const { spacing, colors } = useTheme();
  const { t } = useTranslation();

  useEffect(() => {
    if (group) {
      setName(group.name);
      setDiscoverable(group.discoverable);
      setJoinPolicy(group.joinPolicy);
    }
  }, [group]);

  const handleUpdate = async () => {
    if (!name.trim()) {
      Alert.alert(t('common.error'), t('groups.enterNameError'));
      return;
    }

    setLoading(true);
    try {
      await updateGroup(groupId, { 
        name, 
        discoverable, 
        joinPolicy 
      });
      Alert.alert(t('common.success'), t('groups.updated'));
      navigation.goBack();
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderRadio = (value: 'request_to_join' | 'invite_only', label: string, description: string) => (
    <TouchableOpacity 
      onPress={() => setJoinPolicy(value)}
      style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.md }}
    >
      <View style={{
        height: 20,
        width: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: joinPolicy === value ? colors.primary : colors.textSecondary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.sm,
        marginTop: 2
      }}>
        {joinPolicy === value && (
          <View style={{
            height: 10,
            width: 10,
            borderRadius: 5,
            backgroundColor: colors.primary,
          }} />
        )}
      </View>
      <View style={{ flex: 1 }}>
        <Typography variant="body" style={{ fontWeight: 'bold' }}>{label}</Typography>
        <Typography variant="caption" color={colors.textSecondary}>{description}</Typography>
      </View>
    </TouchableOpacity>
  );

  if (!group) return null;

  return (
    <Screen style={{ padding: spacing.lg }}>
      <Typography variant="h2" style={{ marginBottom: spacing.lg }}>
        {t('groups.edit')}
      </Typography>

      <Input
        label={t('groups.name')}
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        containerStyle={{ marginBottom: spacing.lg }}
      />

      <View style={{ marginBottom: spacing.lg }}>
        <Typography variant="h3" style={{ marginBottom: spacing.sm }}>{t('groups.privacySettings', 'Privacy & Access')}</Typography>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
          <View style={{ flex: 1, marginRight: spacing.md }}>
            <Typography variant="body" style={{ fontWeight: 'bold' }}>{t('groups.discoverable', 'Discoverable')}</Typography>
            <Typography variant="caption" color={colors.textSecondary}>
              {t('groups.discoverableDesc', 'Allow people to find this group in search')}
            </Typography>
          </View>
          <Switch 
            value={discoverable} 
            onValueChange={setDiscoverable} 
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>

        {discoverable && (
          <View style={{ marginTop: spacing.sm }}>
            <Typography variant="body" style={{ fontWeight: 'bold', marginBottom: spacing.sm }}>
              {t('groups.howToJoin', 'How can people join?')}
            </Typography>
            
            {renderRadio(
              'request_to_join', 
              t('groups.requestToJoin', 'Request to Join'), 
              t('groups.requestToJoinDesc', 'Admins approve new members')
            )}
            
            {renderRadio(
              'invite_only', 
              t('groups.inviteOnly', 'Invite Only'), 
              t('groups.inviteOnlyDesc', 'Only people with an invite can join')
            )}
          </View>
        )}
      </View>

      <Button
        title={t('common.save')}
        onPress={handleUpdate}
        loading={loading}
        style={{ marginBottom: spacing.md }}
      />
      
      <Button
        title={t('common.cancel')}
        onPress={() => navigation.goBack()}
        variant="ghost"
        disabled={loading}
      />
    </Screen>
  );
};
