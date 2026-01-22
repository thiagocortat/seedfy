import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen } from '../../components/Screen';
import { Typography } from '../../components/Typography';
import { Button } from '../../components/Button';
import { useTheme } from '../../theme';
import { useUserStore } from '../../store/useUserStore';
import { useAuthStore } from '../../store/useAuthStore';
import { notificationService } from '../../services/notificationService';

export const OnboardingNotificationsScreen = () => {
  const [loading, setLoading] = useState(false);
  
  const { spacing, colors } = useTheme();
  const navigation = useNavigation<any>();
  const user = useAuthStore(state => state.user);
  const updateProfile = useUserStore(state => state.updateProfile);

  const handleFinish = async (enableNotifications = false) => {
    if (!user) return;

    setLoading(true);
    try {
      let pushToken = null;
      if (enableNotifications) {
        pushToken = await notificationService.registerForPushNotificationsAsync();
        // Schedule default reminder at 8 AM
        await notificationService.scheduleDailyReminder(8, 0);
      }

      await updateProfile(user.id, { 
        onboardingCompleted: true,
        pushToken: pushToken
      });
      // RootNavigator will automatically switch to MainTabNavigator
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen style={{ padding: spacing.lg, justifyContent: 'center' }}>
      <Typography variant="h1" style={{ marginBottom: spacing.xs }}>
        Stay Connected
      </Typography>
      <Typography variant="body" color={colors.textSecondary} style={{ marginBottom: spacing.xl }}>
        Get daily reminders to keep up with your challenges.
      </Typography>

      <Button
        title="Enable Notifications"
        onPress={() => handleFinish(true)}
        loading={loading}
        style={{ marginBottom: spacing.md }}
      />
      
      <Button
        title="Maybe Later"
        variant="ghost"
        onPress={() => handleFinish(false)}
        disabled={loading}
      />
    </Screen>
  );
};
