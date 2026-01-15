import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen } from '../../components/Screen';
import { Typography } from '../../components/Typography';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { useTheme } from '../../theme';
import { useGroupStore } from '../../store/useGroupStore';
import { useAuthStore } from '../../store/useAuthStore';

export const CreateGroupScreen = () => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { spacing, colors } = useTheme();
  const navigation = useNavigation<any>();
  const user = useAuthStore(state => state.user);
  const createGroup = useGroupStore(state => state.createGroup);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }
    
    if (!user) return;

    setLoading(true);
    try {
      await createGroup(user.id, name);
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen style={{ padding: spacing.lg }}>
      <Typography variant="h2" style={{ marginBottom: spacing.lg }}>
        Create New Group
      </Typography>

      <Input
        label="Group Name"
        placeholder="e.g. Morning Prayer Warriors"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        containerStyle={{ marginBottom: spacing.lg }}
      />

      <Button
        title="Create Group"
        onPress={handleCreate}
        loading={loading}
      />
    </Screen>
  );
};
