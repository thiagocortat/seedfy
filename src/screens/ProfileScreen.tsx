import React from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen } from '../components/Screen';
import { Typography } from '../components/Typography';
import { useAuthStore } from '../store/useAuthStore';
import { useUserStore } from '../store/useUserStore';
import { Button } from '../components/Button';
import { supabase } from '../services/supabase';
import { useTheme } from '../theme';

export const ProfileScreen = () => {
  const logout = useAuthStore(state => state.signOut);
  const profile = useUserStore(state => state.profile);
  const navigation = useNavigation<any>();
  const { spacing, colors } = useTheme();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    logout();
  };

  return (
    <Screen style={{ padding: 16 }}>
      <Typography variant="h1" style={{ marginBottom: spacing.lg }}>Profile</Typography>
      
      {profile && (
        <View style={{ marginBottom: spacing.xl }}>
          <Typography variant="h3">{profile.name}</Typography>
          <Typography variant="body" color={colors.textSecondary}>{profile.email}</Typography>
        </View>
      )}

      <Button 
        title="My Groups" 
        onPress={() => navigation.navigate('GroupList')} 
        style={{ marginBottom: spacing.md }}
      />

      <Button title="Sign Out" onPress={handleSignOut} variant="outline" />
    </Screen>
  );
};
