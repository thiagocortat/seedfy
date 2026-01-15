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

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
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

      // Create user profile in Supabase immediately
      await userService.createUser(data.user.id, email);
      
      // Fetch the profile to update the store and prevent race conditions
      await fetchProfile(data.user.id);
      
      setUser(data.user);
      // Onboarding flow will be triggered by RootNavigator observing user state
    } catch (err: any) {
      setError(err.message || 'Failed to sign up');
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen style={{ padding: spacing.lg, justifyContent: 'center' }}>
      <Typography variant="h1" style={{ marginBottom: spacing.xs }}>
        Join Seedfy
      </Typography>
      <Typography variant="body" color={colors.textSecondary} style={{ marginBottom: spacing.xl }}>
        Start your group spiritual challenges today
      </Typography>

      <Input
        label="Email"
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <Input
        label="Password"
        placeholder="Create a password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Input
        label="Confirm Password"
        placeholder="Confirm your password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        error={error}
        containerStyle={{ marginBottom: spacing.lg }}
      />

      <Button
        title="Sign Up"
        onPress={handleSignUp}
        loading={loading}
        style={{ marginBottom: spacing.lg }}
      />

      <View style={styles.footer}>
        <Typography variant="body" color={colors.textSecondary}>
          Already have an account?{' '}
        </Typography>
        <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
          <Typography variant="body" color={colors.primary} weight="bold">
            Sign In
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
