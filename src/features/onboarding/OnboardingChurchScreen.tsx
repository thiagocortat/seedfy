import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Screen } from '../../components/Screen';
import { Typography } from '../../components/Typography';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { useTheme } from '../../theme';
import { useUserStore } from '../../store/useUserStore';
import { useAuthStore } from '../../store/useAuthStore';
import { churchService, Church } from '../../services/churchService';

export const OnboardingChurchScreen = () => {
  const [churches, setChurches] = useState<Church[]>([]);
  const [selectedChurchId, setSelectedChurchId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const { spacing, colors } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const user = useAuthStore(state => state.user);
  const updateProfile = useUserStore(state => state.updateProfile);
  const isEditing = route.params?.isEditing;

  useEffect(() => {
    const fetchChurches = async () => {
      try {
        const data = await churchService.getChurches();
        setChurches(data);
      } catch (error) {
        console.error(error);
      } finally {
        setFetching(false);
      }
    };
    fetchChurches();
  }, []);

  const handleNext = async (skip = false) => {
    if (!user) return;

    setLoading(true);
    try {
      await updateProfile(user.id, { churchId: skip ? null : selectedChurchId });
      
      if (isEditing) {
        navigation.goBack();
      } else {
        navigation.navigate('OnboardingInterests');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen style={{ padding: spacing.lg }}>
      <Typography variant="h1" style={{ marginBottom: spacing.xs }}>
        {isEditing ? 'Update your Church' : 'Find your Church'}
      </Typography>
      <Typography variant="body" color={colors.textSecondary} style={{ marginBottom: spacing.lg }}>
        {isEditing ? 'Change your local community connection.' : 'Connect with your local community.'}
      </Typography>

      <FlatList
        data={churches}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Card 
            variant={selectedChurchId === item.id ? 'elevated' : 'outlined'}
            onPress={() => setSelectedChurchId(item.id)}
            style={{ 
              marginBottom: spacing.md, 
              borderColor: selectedChurchId === item.id ? colors.primary : colors.border 
            }}
          >
            <Typography variant="h3">{item.name}</Typography>
            <Typography variant="caption" color={colors.textSecondary}>
              {item.city}, {item.state}
            </Typography>
          </Card>
        )}
        style={{ flex: 1, marginBottom: spacing.lg }}
      />

      <Button
        title={isEditing ? "Save Changes" : "Continue"}
        onPress={() => handleNext(false)}
        loading={loading}
        disabled={!selectedChurchId}
        style={{ marginBottom: spacing.md }}
      />
      
      {!isEditing && (
        <Button
          title="Skip for now"
          variant="ghost"
          onPress={() => handleNext(true)}
          disabled={loading}
        />
      )}
    </Screen>
  );
};
