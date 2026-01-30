import React, { useEffect, useState } from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Screen } from '../../components/Screen';
import { Typography } from '../../components/Typography';
import { useTheme } from '../../theme';
import { journeyService, JourneyChapter } from '../../services/journeyService';
import { challengeService } from '../../services/challengeService';
import { useAuthStore } from '../../store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';

export const ChapterViewerScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { journeyId, challengeId, dayIndex } = route.params;
  
  const [chapter, setChapter] = useState<JourneyChapter | null>(null);
  const [reflection, setReflection] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { spacing, colors, layout } = useTheme();
  const { user } = useAuthStore();

  useEffect(() => {
    loadContent();
  }, [journeyId, dayIndex]);

  const loadContent = async () => {
    if (!user) return;
    try {
      setLoading(true);
      
      const [chapterData, checkin] = await Promise.all([
        journeyService.getChapter(journeyId, dayIndex),
        challengeService.getCheckinForDay(user.id, challengeId, dayIndex)
      ]);
      
      setChapter(chapterData);
      if (checkin) {
        setReflection(checkin.reflectionText || null);
      }
    } catch (error) {
      console.error('Error loading chapter content:', error);
    } finally {
      setLoading(false);
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
      <Screen style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Typography variant="h3">Content not found</Typography>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border }}>
          <Ionicons name="close" size={24} color={colors.text} onPress={() => navigation.goBack()} />
          <Typography variant="h3" style={{ marginLeft: spacing.md }}>Day {dayIndex}</Typography>
      </View>
      
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 100 }}>
        <Typography variant="h1" style={{ marginBottom: spacing.lg }}>
          {chapter.title}
        </Typography>

        <Section title="Narrative" icon="book-outline" colors={colors} spacing={spacing}>
          <Typography variant="body" style={{ lineHeight: 24 }}>{chapter.narrative}</Typography>
        </Section>

        <Section title="Focus" icon="eye-outline" colors={colors} spacing={spacing}>
          <Typography variant="body" style={{ fontStyle: 'italic' }}>{chapter.focus}</Typography>
        </Section>

        <Section title="Practice" icon="fitness-outline" colors={colors} spacing={spacing}>
          <Typography variant="body">{chapter.practice}</Typography>
        </Section>

        {reflection && (
          <View style={{ marginTop: spacing.xl, padding: spacing.md, backgroundColor: colors.surfaceVariant, borderRadius: layout.radius.md }}>
            <Typography variant="h3" style={{ marginBottom: spacing.sm }}>My Reflection</Typography>
            <Typography variant="body" style={{ fontStyle: 'italic' }}>
              "{reflection}"
            </Typography>
          </View>
        )}
      </ScrollView>
    </Screen>
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
