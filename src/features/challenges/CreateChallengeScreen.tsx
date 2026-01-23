import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen } from '../../components/Screen';
import { Typography } from '../../components/Typography';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { useTheme } from '../../theme';
import { useChallengeStore } from '../../store/useChallengeStore';
import { useGroupStore } from '../../store/useGroupStore';
import { useAuthStore } from '../../store/useAuthStore';
import { ChallengeType } from '../../services/challengeService';
import { useTranslation } from 'react-i18next';

const DURATIONS = [3, 7, 14, 21];

export const CreateChallengeScreen = () => {
  const [step, setStep] = useState(1);
  const [type, setType] = useState<ChallengeType>('reading');
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(7);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { spacing, colors, layout } = useTheme();
  const navigation = useNavigation<any>();
  const user = useAuthStore(state => state.user);
  const { groups, fetchUserGroups } = useGroupStore();
  const createChallenge = useChallengeStore(state => state.createChallenge);
  const { t } = useTranslation();

  const TYPES: { type: ChallengeType; label: string }[] = [
    { type: 'reading', label: t('challenges.types.reading') },
    { type: 'meditation', label: t('challenges.types.meditation') },
    { type: 'fasting', label: t('challenges.types.fasting') },
    { type: 'communion', label: t('challenges.types.communion') },
  ];

  useEffect(() => {
    if (user) fetchUserGroups(user.id);
  }, [user]);

  const handleCreate = async () => {
    if (!selectedGroupId || !user) return;
    
    setLoading(true);
    try {
      await createChallenge(
        user.id,
        selectedGroupId,
        type,
        title || `${TYPES.find(t => t.type === type)?.label} Challenge`,
        duration,
        new Date()
      );
      navigation.goBack();
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderTypeSelection = () => (
    <View>
      <Typography variant="h2" style={{ marginBottom: spacing.lg }}>{t('challenges.selectType')}</Typography>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
        {TYPES.map(t => (
          <TouchableOpacity
            key={t.type}
            onPress={() => { setType(t.type); setStep(2); }}
            style={{
              width: '45%',
              aspectRatio: 1,
              backgroundColor: type === t.type ? colors.primary : colors.surface,
              borderRadius: layout.radius.lg,
              padding: spacing.md,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: colors.border
            }}
          >
            <Typography variant="h3" color={type === t.type ? colors.surface : colors.text} align="center">
              {t.label}
            </Typography>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderDetails = () => (
    <View>
      <Typography variant="h2" style={{ marginBottom: spacing.lg }}>{t('challenges.details')}</Typography>
      
      <Input
        label={t('challenges.titleOptional')}
        placeholder={t('challenges.placeholderTitle')}
        value={title}
        onChangeText={setTitle}
        containerStyle={{ marginBottom: spacing.lg }}
      />

      <Typography variant="label" style={{ marginBottom: spacing.sm }}>{t('challenges.duration')}</Typography>
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl }}>
        {DURATIONS.map(d => (
          <TouchableOpacity
            key={d}
            onPress={() => setDuration(d)}
            style={{
              paddingVertical: spacing.sm,
              paddingHorizontal: spacing.md,
              backgroundColor: duration === d ? colors.primary : colors.surface,
              borderRadius: layout.radius.md,
              borderWidth: 1,
              borderColor: colors.border
            }}
          >
            <Typography color={duration === d ? colors.surface : colors.text}>{d} {t('common.days')}</Typography>
          </TouchableOpacity>
        ))}
      </View>

      <Typography variant="label" style={{ marginBottom: spacing.sm }}>{t('challenges.selectGroup')}</Typography>
      {groups.length > 0 ? (
        <ScrollView style={{ maxHeight: 200 }}>
          {groups.map(g => (
            <TouchableOpacity
              key={g.id}
              onPress={() => setSelectedGroupId(g.id)}
              style={{
                padding: spacing.md,
                backgroundColor: selectedGroupId === g.id ? colors.primary : colors.surface,
                borderRadius: layout.radius.md,
                marginBottom: spacing.sm,
                borderWidth: 1,
                borderColor: colors.border
              }}
            >
              <Typography color={selectedGroupId === g.id ? colors.surface : colors.text}>{g.name}</Typography>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <Card style={{ marginBottom: spacing.md, padding: spacing.md }}>
          <Typography variant="body" color={colors.textSecondary} align="center">
            {t('challenges.noGroups')}
          </Typography>
          <TouchableOpacity onPress={() => navigation.navigate('Profile', { screen: 'CreateGroup' })}>
            <Typography variant="label" color={colors.primary} align="center" style={{ marginTop: spacing.xs }}>
              {t('challenges.createGroup')}
            </Typography>
          </TouchableOpacity>
        </Card>
      )}

      <Button
        title={t('challenges.create')}
        onPress={() => {
          if (!selectedGroupId) {
            Alert.alert(t('challenges.selectionRequired'), t('challenges.selectGroupError'));
            return;
          }
          handleCreate();
        }}
        loading={loading}
        // Button is always enabled to provide feedback
        style={{ marginTop: spacing.lg }}
      />
    </View>
  );

  return (
    <Screen style={{ padding: spacing.lg }}>
      {step === 1 ? renderTypeSelection() : renderDetails()}
    </Screen>
  );
};
