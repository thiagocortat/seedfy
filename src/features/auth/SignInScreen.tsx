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

export const SignInScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { spacing, colors } = useTheme();
  const setUser = useAuthStore(state => state.setUser);
  const navigation = useNavigation<any>();

  const handleSignIn = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
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
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen style={{ padding: spacing.lg, justifyContent: 'center' }}>
      <Typography variant="h1" style={{ marginBottom: spacing.xs }}>
        Welcome Back
      </Typography>
      <Typography variant="body" color={colors.textSecondary} style={{ marginBottom: spacing.xl }}>
        Sign in to continue your spiritual journey
      </Typography>

      <Input
        label="Email"
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        error={error}
      />

      <Input
        label="Password"
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        containerStyle={{ marginBottom: spacing.lg }}
      />

      <Button
        title="Sign In"
        onPress={handleSignIn}
        loading={loading}
        style={{ marginBottom: spacing.lg }}
      />

      <View style={styles.footer}>
        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <Typography variant="body" color={colors.primary}>
            Create Account
          </Typography>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Typography variant="body" color={colors.textSecondary}>
            Forgot Password?
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
