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
import { useTranslation } from 'react-i18next';

export const CreateGroupScreen = () => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { spacing, colors } = useTheme();
  const navigation = useNavigation<any>();
  const user = useAuthStore(state => state.user);
  const createGroup = useGroupStore(state => state.createGroup);
  const { t } = useTranslation();

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert(t('common.error'), t('groups.enterNameError'));
      return;
    }
    
    if (!user) return;

    setLoading(true);
    try {
      await createGroup(user.id, name);
      navigation.goBack();
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen style={{ padding: spacing.lg }}>
      <Typography variant="h2" style={{ marginBottom: spacing.lg }}>
        {t('groups.createNew')}
      </Typography>

      <Input
        label={t('groups.name')}
        placeholder={t('groups.placeholderName')}
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        containerStyle={{ marginBottom: spacing.lg }}
      />

      <Button
        title={t('groups.createAction')}
        onPress={handleCreate}
        loading={loading}
        style={{ marginBottom: spacing.md }}
      />
      
      <Button
        title={t('common.cancel')}
        onPress={() => navigation.goBack()}
        variant="ghost"
        disabled={loading}
      />
    </Screen>
  );
};
