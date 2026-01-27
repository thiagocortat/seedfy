import React, { useState, useEffect } from 'react';
import { View, Image, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Screen } from '../../components/Screen';
import { Typography } from '../../components/Typography';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Card } from '../../components/Card';
import { useTheme } from '../../theme';
import { useGroupStore } from '../../store/useGroupStore';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

export const GroupInviteScreen = () => {
  const { spacing, colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { groupId } = route.params;
  const { t } = useTranslation();
  
  const { searchUser, searchResult, clearSearch, inviteUser, isLoading } = useGroupStore();
  const [email, setEmail] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    clearSearch();
    return () => clearSearch();
  }, []);

  const handleSearch = async () => {
    if (!email.trim()) return;
    setHasSearched(false);
    await searchUser(email.trim());
    setHasSearched(true);
  };

  const handleInvite = async () => {
    if (!searchResult) return;
    try {
      await inviteUser(groupId, searchResult.id);
      Alert.alert(t('common.success'), t('invitations.sentMessage'));
      navigation.goBack();
    } catch (error: any) {
      // Check for Supabase error code 23505 (unique_violation)
      // The error object structure from Supabase JS client might wrap the DB error
      const isDuplicate = error.code === '23505' || error.message?.includes('duplicate key') || error.message?.includes('unique_pending_invite');
      
      const msg = isDuplicate 
        ? t('invitations.duplicate') 
        : t('invitations.sendError');
      
      Alert.alert(t('common.error'), msg);
    }
  };

  return (
    <Screen style={{ padding: spacing.lg }}>
      <Typography variant="h2" style={{ marginBottom: spacing.md }}>
        {t('groups.inviteMember')}
      </Typography>
      
      <Typography variant="body" color={colors.textSecondary} style={{ marginBottom: spacing.lg }}>
        {t('groups.inviteDescription')}
      </Typography>

      <View style={{ marginBottom: spacing.xl }}>
        <Input
            placeholder={t('auth.emailPlaceholder')}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={{ marginBottom: spacing.md }}
        />
        <Button 
            title={t('common.search')} 
            onPress={handleSearch} 
            loading={isLoading && !searchResult}
            disabled={!email.trim() || isLoading}
            style={{ height: 50, justifyContent: 'center' }}
        />
      </View>

      {searchResult && (
        <Card style={{ padding: spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg }}>
             <View 
              style={{ 
                width: 50, 
                height: 50, 
                borderRadius: 25, 
                backgroundColor: colors.border, 
                marginRight: spacing.md,
                overflow: 'hidden',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              {searchResult.avatarUrl ? (
                <Image source={{ uri: searchResult.avatarUrl }} style={{ width: 50, height: 50 }} />
              ) : (
                <Ionicons name="person" size={24} color={colors.secondary} />
              )}
            </View>
            <View>
                <Typography variant="h3">{searchResult.displayName}</Typography>
                <Typography variant="caption" color={colors.textSecondary}>{email}</Typography>
            </View>
          </View>
          
          <Button 
            title={t('groups.sendInvite')} 
            onPress={handleInvite} 
            loading={isLoading}
          />
        </Card>
      )}
      
      {!isLoading && hasSearched && !searchResult && (
        <View style={{ marginTop: spacing.md, alignItems: 'center' }}>
           <Typography variant="body" color={colors.error}>
             {t('invitations.userNotFound')}
           </Typography>
        </View>
      )}
    </Screen>
  );
};
