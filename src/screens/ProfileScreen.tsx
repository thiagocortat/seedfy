import React from 'react';
import { View, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen } from '../components/Screen';
import { Typography } from '../components/Typography';
import { useAuthStore } from '../store/useAuthStore';
import { useUserStore } from '../store/useUserStore';
import { Button } from '../components/Button';
import { supabase } from '../services/supabase';
import { useTheme } from '../theme';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../i18n';

export const ProfileScreen = () => {
  const logout = useAuthStore(state => state.signOut);
  const profile = useUserStore(state => state.profile);
  const navigation = useNavigation<any>();
  const { spacing, colors } = useTheme();
  const { t } = useTranslation();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    logout();
  };

  const changeLanguage = async () => {
    Alert.alert(
      t('profile.changeLanguage'),
      t('profile.language'),
      [
        { text: 'English', onPress: () => setLanguage('en') },
        { text: 'Português', onPress: () => setLanguage('pt-BR') },
        { text: 'Español', onPress: () => setLanguage('es') },
        { text: t('common.cancel'), style: 'cancel' }
      ]
    );
  };

  const setLanguage = async (lang: string) => {
    await AsyncStorage.setItem('language', lang);
    i18n.changeLanguage(lang);
  };

  return (
    <Screen style={{ padding: 16 }}>
      <Typography variant="h1" style={{ marginBottom: spacing.lg }}>{t('profile.title')}</Typography>
      
      {profile && (
        <View style={{ marginBottom: spacing.xl }}>
          <Typography variant="h3">{profile.name}</Typography>
          <Typography variant="body" color={colors.textSecondary}>{profile.email}</Typography>
        </View>
      )}

      <Button 
        title={t('profile.myGroups')} 
        onPress={() => navigation.navigate('GroupList')} 
        style={{ marginBottom: spacing.md }}
      />

      <Button 
        title={t('profile.changeLanguage')} 
        onPress={changeLanguage} 
        variant="outline"
        style={{ marginBottom: spacing.md }}
      />

      <Button title={t('profile.signOut')} onPress={handleSignOut} variant="outline" />
    </Screen>
  );
};
