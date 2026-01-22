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

const TYPES: { type: ChallengeType; label: string }[] = [
  { type: 'reading', label: 'Bible Reading' },
  { type: 'meditation', label: 'Meditation' },
  { type: 'fasting', label: 'Fasting' },
  { type: 'communion', label: 'Communion' },
];

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
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderTypeSelection = () => (
    <View>
      <Typography variant="h2" style={{ marginBottom: spacing.lg }}>Select Challenge Type</Typography>
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
      <Typography variant="h2" style={{ marginBottom: spacing.lg }}>Challenge Details</Typography>
      
      <Input
        label="Title (Optional)"
        placeholder="e.g. Gospel of John"
        value={title}
        onChangeText={setTitle}
        containerStyle={{ marginBottom: spacing.lg }}
      />

      <Typography variant="label" style={{ marginBottom: spacing.sm }}>Duration (Days)</Typography>
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
            <Typography color={duration === d ? colors.surface : colors.text}>{d} Days</Typography>
          </TouchableOpacity>
        ))}
      </View>

      <Typography variant="label" style={{ marginBottom: spacing.sm }}>Select Group</Typography>
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
            You don't have any groups yet.
          </Typography>
          <TouchableOpacity onPress={() => navigation.navigate('Groups', { screen: 'CreateGroup' })}>
            <Typography variant="label" color={colors.primary} align="center" style={{ marginTop: spacing.xs }}>
              Create a Group
            </Typography>
          </TouchableOpacity>
        </Card>
      )}

      <Button
        title="Create Challenge"
        onPress={() => {
          if (!selectedGroupId) {
            Alert.alert('Selection Required', 'Please select a group to create a challenge.');
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
