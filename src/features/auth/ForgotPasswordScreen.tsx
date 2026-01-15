import React, { useState } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { supabase } from '../../services/supabase';
import { Screen } from '../../components/Screen';
import { Typography } from '../../components/Typography';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { useTheme } from '../../theme';
import { useNavigation } from '@react-navigation/native';

export const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { spacing, colors } = useTheme();
  const navigation = useNavigation<any>();

  const handleReset = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      
      Alert.alert('Success', 'Password reset email sent!', [
        { text: 'OK', onPress: () => navigation.navigate('SignIn') }
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen style={{ padding: spacing.lg, justifyContent: 'center' }}>
      <Typography variant="h1" style={{ marginBottom: spacing.xs }}>
        Reset Password
      </Typography>
      <Typography variant="body" color={colors.textSecondary} style={{ marginBottom: spacing.xl }}>
        Enter your email to receive a reset link
      </Typography>

      <Input
        label="Email"
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        containerStyle={{ marginBottom: spacing.lg }}
      />

      <Button
        title="Send Reset Link"
        onPress={handleReset}
        loading={loading}
        style={{ marginBottom: spacing.lg }}
      />

      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.center}>
        <Typography variant="body" color={colors.primary}>
          Back to Sign In
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
