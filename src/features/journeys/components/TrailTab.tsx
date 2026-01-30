import React, { useEffect, useState } from 'react';
import { View, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Typography } from '../../../components/Typography';
import { useTheme } from '../../../theme';
import { journeyService, JourneyChapter } from '../../../services/journeyService';
import { challengeService } from '../../../services/challengeService';
import { useAuthStore } from '../../../store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  journeyId: string;
  challengeId: string;
  currentDayIndex: number;
}

export const TrailTab: React.FC<Props> = ({ journeyId, challengeId, currentDayIndex }) => {
  const [chapters, setChapters] = useState<JourneyChapter[]>([]);
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { spacing, colors, layout } = useTheme();
  const { user } = useAuthStore();
  const navigation = useNavigation<any>();

  useEffect(() => {
    loadTrail();
  }, [journeyId, challengeId]);

  const loadTrail = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [chaptersData, checkins] = await Promise.all([
        journeyService.getChapters(journeyId),
        challengeService.getUserCheckIns(user.id, challengeId)
      ]);
      
      setChapters(chaptersData);
      
      const completedDayIndices = await challengeService.getCompletedDayIndices(user.id, challengeId);
      setCompletedDays(completedDayIndices);
      
    } catch (error) {
      console.error('Error loading trail:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: JourneyChapter }) => {
    const isCompleted = completedDays.includes(item.dayIndex);
    const isAvailable = item.dayIndex === currentDayIndex && !isCompleted;
    const isLocked = item.dayIndex > currentDayIndex;
    const isPastUnfinished = item.dayIndex < currentDayIndex && !isCompleted; // Missed day

    let iconName: any = 'lock-closed';
    let iconColor = colors.textSecondary;
    let statusText = 'Locked';

    if (isCompleted) {
      iconName = 'checkmark-circle';
      iconColor = colors.success || '#4CAF50';
      statusText = 'Completed';
    } else if (isAvailable) {
      iconName = 'play-circle';
      iconColor = colors.primary;
      statusText = 'Available';
    } else if (isPastUnfinished) {
      iconName = 'close-circle';
      iconColor = colors.error || '#F44336';
      statusText = 'Missed';
    }

    const handlePress = () => {
        if (isLocked) {
             Alert.alert("Locked", "This chapter is not yet available.");
             return;
        }
        
        // Navigate to viewer
        navigation.navigate('ChapterViewer', {
            journeyId,
            challengeId,
            dayIndex: item.dayIndex
        });
    };

    return (
      <TouchableOpacity 
        onPress={handlePress}
        disabled={isLocked}
        style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          padding: spacing.md, 
          backgroundColor: colors.surface,
          borderRadius: layout.radius.md,
          marginBottom: spacing.sm,
          opacity: isLocked ? 0.6 : 1
        }}
      >
        <View style={{ marginRight: spacing.md }}>
            <Ionicons name={iconName} size={32} color={iconColor} />
        </View>
        
        <View style={{ flex: 1 }}>
          <Typography variant="h3">Day {item.dayIndex}</Typography>
          <Typography variant="body">{item.title}</Typography>
        </View>

        {/* Optional: Add badge for milestones (7, 14, 21) */}
        {item.dayIndex % 7 === 0 && (
             <Ionicons name="trophy-outline" size={20} color={colors.accent} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, padding: spacing.md }}>
      <FlatList
        data={chapters}
        keyExtractor={item => item.dayIndex.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
      />
    </View>
  );
};
