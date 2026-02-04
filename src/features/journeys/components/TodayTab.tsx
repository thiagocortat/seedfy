import React, { useEffect, useState } from 'react';
import { View, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Typography } from '../../../components/Typography';
import { Button } from '../../../components/Button';
import { useTheme } from '../../../theme';
import { journeyService, JourneyChapter } from '../../../services/journeyService';
import { challengeService } from '../../../services/challengeService';
import { useAuthStore } from '../../../store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

interface Props {
  journeyId: string;
  challengeId: string;
  dayIndex: number;
  onComplete?: () => void;
}

export const TodayTab: React.FC<Props> = ({ journeyId, challengeId, dayIndex, onComplete }) => {
  const [chapter, setChapter] = useState<JourneyChapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [reflection, setReflection] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isCompletedToday, setIsCompletedToday] = useState(false);
  
  const { spacing, colors, layout } = useTheme();
  const { user } = useAuthStore();
  const { t } = useTranslation();

  useEffect(() => {
    loadContent();
  }, [journeyId, dayIndex]);

  const loadContent = async () => {
    if (!user) return;
    try {
      setLoading(true);
      console.log(`Loading content for journey ${journeyId}, day ${dayIndex}`);
      
      // Load chapter content
      const chapterData = await journeyService.getChapter(journeyId, dayIndex);
      setChapter(chapterData);
      
      // Check if already completed today
      const checkin = await challengeService.getCheckinForDay(user.id, challengeId, dayIndex);
      console.log('Checkin result:', checkin);
      
      if (checkin) {
        setIsCompletedToday(true);
        setReflection(checkin.reflectionText || '');
      } else {
        setIsCompletedToday(false);
        setReflection('');
      }
    } catch (error) {
      console.error('Error loading today content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!user || !chapter) return;
    
    try {
      setSubmitting(true);
      await challengeService.checkIn(user.id, challengeId, {
        dayIndex: dayIndex,
        reflectionText: reflection,
        visibility: 'private' // Default private for MVP
      });
      
      setIsCompletedToday(true);
      Alert.alert(t('journeys.congratulations'), t('journeys.dayCompleted'));
      if (onComplete) onComplete();
    } catch (error) {
      console.error('Error completing day:', error);
      Alert.alert(t('common.error'), t('journeys.contentNotFound')); // Or a better error message
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!chapter) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg }}>
        <Typography variant="h3" style={{ textAlign: 'center' }}>{t('journeys.contentNotFound')}</Typography>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 100 }}>
      <Typography variant="label" color={colors.primary} style={{ marginBottom: spacing.sm }}>
        {t('journeys.day', { day: dayIndex })}
      </Typography>
      
      <Typography variant="h1" style={{ marginBottom: spacing.lg }}>
        {chapter.title}
      </Typography>

      <Section title={t('journeys.narrative')} icon="book-outline" colors={colors} spacing={spacing}>
        <Typography variant="body" style={{ lineHeight: 24 }}>{chapter.narrative}</Typography>
      </Section>

      <Section title={t('journeys.focus')} icon="eye-outline" colors={colors} spacing={spacing}>
        <Typography variant="body" style={{ fontStyle: 'italic' }}>{chapter.focus}</Typography>
      </Section>

      <Section title={t('journeys.practice')} icon="fitness-outline" colors={colors} spacing={spacing}>
        <Typography variant="body">{chapter.practice}</Typography>
      </Section>

      <View style={{ marginTop: spacing.xl, marginBottom: spacing.lg }}>
        <Typography variant="h3" style={{ marginBottom: spacing.sm }}>{t('journeys.reflection')}</Typography>
        <Typography variant="body" color={colors.textSecondary} style={{ marginBottom: spacing.md }}>
          {chapter.reflectionPrompt}
        </Typography>
        
        <TextInput
          style={{
            backgroundColor: colors.surface,
            borderRadius: layout.radius.md,
            padding: spacing.md,
            minHeight: 120,
            textAlignVertical: 'top',
            color: colors.text,
            borderWidth: 1,
            borderColor: colors.border
          }}
          placeholder={t('journeys.reflectionPlaceholder')}
          placeholderTextColor={colors.textSecondary}
          multiline
          value={reflection}
          onChangeText={setReflection}
          editable={!isCompletedToday} // Read-only if completed? Or allow edit? PRD says read-only in "Revisitar", but maybe editable today? Let's lock for simplicity of "Completed" state.
        />
      </View>

      <Button
        title={isCompletedToday ? t('journeys.completedToday') + " ✅" : t('journeys.completeDay')}
        onPress={handleComplete}
        disabled={isCompletedToday}
        loading={submitting}
        variant={isCompletedToday ? "outline" : "primary"}
      />
    </ScrollView>
  );
};

const Section = ({ title, icon, children, colors, spacing }: any) => (
  <View style={{ marginBottom: spacing.lg }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs }}>
      <Ionicons name={icon} size={20} color={colors.primary} style={{ marginRight: spacing.sm }} />
      <Typography variant="h3">{title}</Typography>
    </View>
    <View style={{ paddingLeft: 28 }}>
      {children}
    </View>
  </View>
);
