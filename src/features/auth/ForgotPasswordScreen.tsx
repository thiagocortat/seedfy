import React, { useState } from 'react';
import { View, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import { supabase } from '../../services/supabase';
import { Screen } from '../../components/Screen';
import { Typography } from '../../components/Typography';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { useTheme } from '../../theme';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

export const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { spacing, colors } = useTheme();
  const navigation = useNavigation<any>();
  const { t } = useTranslation();

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert(t('common.error'), t('auth.fillAllFields'));
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'myglory://reset-password',
      });

      if (error) throw error;
      Alert.alert(t('auth.success'), t('auth.resetPasswordEmailSent'));
      navigation.goBack();
    } catch (err: any) {
      Alert.alert(t('common.error'), err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen style={{ padding: spacing.lg, justifyContent: 'center' }}>
      <Typography variant="h1" style={{ marginBottom: spacing.xs }}>
        {t('auth.resetPassword')}
      </Typography>
      <Typography variant="body" color={colors.textSecondary} style={{ marginBottom: spacing.xl }}>
        {t('auth.resetPasswordSubtitle')}
      </Typography>

      <Input
        label="Email"
        placeholder={t('auth.emailPlaceholder')}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        containerStyle={{ marginBottom: spacing.lg }}
      />

      <Button
        title={t('auth.sendResetLink')}
        onPress={handleResetPassword}
        loading={loading}
        style={{ marginBottom: spacing.lg }}
      />

      <TouchableOpacity onPress={() => navigation.goBack()} style={{ alignItems: 'center' }}>
        <Typography variant="body" color={colors.primary}>
          {t('common.back')}
        </Typography>
      </TouchableOpacity>
    </Screen>
  );
};

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    marginTop: 20,
  },
});
