import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen } from '../../components/Screen';
import { Typography } from '../../components/Typography';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { useTheme } from '../../theme';
import { useUserStore } from '../../store/useUserStore';
import { useAuthStore } from '../../store/useAuthStore';

export const OnboardingProfileScreen = () => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { spacing, colors } = useTheme();
  const navigation = useNavigation<any>();
  const user = useAuthStore(state => state.user);
  const updateProfile = useUserStore(state => state.updateProfile);

  const handleNext = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    if (!user) return;

    setLoading(true);
    try {
      await updateProfile(user.id, { name });
      navigation.navigate('OnboardingChurch');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen style={{ padding: spacing.lg, justifyContent: 'center' }}>
      <Typography variant="h1" style={{ marginBottom: spacing.xs }}>
        Who are you?
      </Typography>
      <Typography variant="body" color={colors.textSecondary} style={{ marginBottom: spacing.xl }}>
        Let's get to know you better.
      </Typography>

      <Input
        label="Full Name"
        placeholder="Enter your name"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        containerStyle={{ marginBottom: spacing.lg }}
      />

      <Button
        title="Continue"
        onPress={handleNext}
        loading={loading}
      />
    </Screen>
  );
};
