import React, { useState } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { supabase } from '../../services/supabase';
import { Screen } from '../../components/Screen';
import { Typography } from '../../components/Typography';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { useTheme } from '../../theme';
import { useAuthStore } from '../../store/useAuthStore';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

export const SignInScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { spacing, colors } = useTheme();
  const setUser = useAuthStore(state => state.setUser);
  const navigation = useNavigation<any>();
  const { t } = useTranslation();

  const handleSignIn = async () => {
    if (!email || !password) {
      setError(t('auth.fillAllFields'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;
      if (data.user) {
        setUser(data.user);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
      Alert.alert(t('common.error'), err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen style={{ padding: spacing.lg, justifyContent: 'center' }}>
      <Typography variant="h1" style={{ marginBottom: spacing.xs }}>
        {t('auth.welcomeBack')}
      </Typography>
      <Typography variant="body" color={colors.textSecondary} style={{ marginBottom: spacing.xl }}>
        {t('auth.signInSubtitle')}
      </Typography>

      <Input
        label="Email"
        placeholder={t('auth.emailPlaceholder')}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        error={error}
      />

      <Input
        label={t('auth.signIn')} // Using signIn as label for password? Or should be Password
        placeholder={t('auth.passwordPlaceholder')}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        containerStyle={{ marginBottom: spacing.lg }}
      />

      <Button
        title={t('auth.signIn')}
        onPress={handleSignIn}
        loading={loading}
        style={{ marginBottom: spacing.lg }}
      />

      <View style={styles.footer}>
        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <Typography variant="body" color={colors.primary}>
            {t('auth.createAccount')}
          </Typography>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Typography variant="body" color={colors.textSecondary}>
            {t('auth.forgotPassword')}
          </Typography>
        </TouchableOpacity>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
});
