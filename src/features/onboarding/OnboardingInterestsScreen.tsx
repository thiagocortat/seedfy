import React, { useState } from 'react';
import { View, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen } from '../../components/Screen';
import { Typography } from '../../components/Typography';
import { Button } from '../../components/Button';
import { useTheme } from '../../theme';
import { useUserStore } from '../../store/useUserStore';
import { useAuthStore } from '../../store/useAuthStore';

const INTERESTS = ['Reading', 'Fasting', 'Meditation', 'Community', 'Prayer', 'Worship'];

export const OnboardingInterestsScreen = () => {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  const { spacing, colors, layout } = useTheme();
  const navigation = useNavigation<any>();
  const user = useAuthStore(state => state.user);
  const updateProfile = useUserStore(state => state.updateProfile);

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleNext = async () => {
    if (!user) return;

    setLoading(true);
    try {
      await updateProfile(user.id, { interests: selectedInterests });
      navigation.navigate('OnboardingNotifications');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen style={{ padding: spacing.lg }}>
      <Typography variant="h1" style={{ marginBottom: spacing.xs }}>
        Your Interests
      </Typography>
      <Typography variant="body" color={colors.textSecondary} style={{ marginBottom: spacing.xl }}>
        Select what you want to focus on.
      </Typography>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.xl }}>
        {INTERESTS.map(interest => {
          const isSelected = selectedInterests.includes(interest);
          return (
            <TouchableOpacity
              key={interest}
              onPress={() => toggleInterest(interest)}
              style={{
                backgroundColor: isSelected ? colors.primary : colors.surface,
                paddingVertical: spacing.sm,
                paddingHorizontal: spacing.md,
                borderRadius: layout.radius.round,
                borderWidth: 1,
                borderColor: isSelected ? colors.primary : colors.border,
              }}
            >
              <Typography 
                variant="label" 
                color={isSelected ? colors.surface : colors.text}
              >
                {interest}
              </Typography>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={{ flex: 1 }} />

      <Button
        title="Continue"
        onPress={handleNext}
        loading={loading}
      />
    </Screen>
  );
};
