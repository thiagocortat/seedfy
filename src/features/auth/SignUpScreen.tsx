import React, { useState } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { supabase } from '../../services/supabase';
import { userService } from '../../services/userService';
import { Screen } from '../../components/Screen';
import { Typography } from '../../components/Typography';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { useTheme } from '../../theme';
import { useAuthStore } from '../../store/useAuthStore';
import { useUserStore } from '../../store/useUserStore';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

export const SignUpScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { spacing, colors } = useTheme();
  const setUser = useAuthStore(state => state.setUser);
  const fetchProfile = useUserStore(state => state.fetchProfile);
  const navigation = useNavigation<any>();
  const { t } = useTranslation();

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      setError(t('auth.fillAllFields'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('auth.passwordsDoNotMatch'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;
      if (!data.user) throw new Error('No user data returned');

      // Check if user profile already exists to prevent duplicate key error
      const existingUser = await userService.getUser(data.user.id);
      
      if (!existingUser) {
        // Create user profile in Supabase only if it doesn't exist
        await userService.createUser(data.user.id, email);
      }
      
      // Fetch the profile to update the store and prevent race conditions
      await fetchProfile(data.user.id);
      
      setUser(data.user);
      // Onboarding flow will be triggered by RootNavigator observing user state
    } catch (err: any) {
      setError(err.message || 'Failed to sign up');
      Alert.alert(t('common.error'), err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen style={{ padding: spacing.lg, justifyContent: 'center' }}>
      <Typography variant="h1" style={{ marginBottom: spacing.xs }}>
        {t('auth.joinSeedfy')}
      </Typography>
      <Typography variant="body" color={colors.textSecondary} style={{ marginBottom: spacing.xl }}>
        {t('auth.signUpSubtitle')}
      </Typography>

      <Input
        label="Email"
        placeholder={t('auth.emailPlaceholder')}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <Input
        label="Password" // Should probably have a key for Password label
        placeholder={t('auth.createPassword')}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Input
        label={t('auth.confirmPassword')}
        placeholder={t('auth.confirmPassword')}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        error={error}
        containerStyle={{ marginBottom: spacing.lg }}
      />

      <Button
        title={t('auth.signUp')}
        onPress={handleSignUp}
        loading={loading}
        style={{ marginBottom: spacing.lg }}
      />

      <View style={styles.footer}>
        <Typography variant="body" color={colors.textSecondary}>
          {t('auth.alreadyHaveAccount')}{' '}
        </Typography>
        <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
          <Typography variant="body" color={colors.primary} weight="bold">
            {t('auth.signIn')}
          </Typography>
        </TouchableOpacity>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
});
