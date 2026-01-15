import React, { useEffect } from 'react';
import { View, FlatList, Image } from 'react-native';
import { Screen } from '../components/Screen';
import { Typography } from '../components/Typography';
import { Card } from '../components/Card';
import { useTheme } from '../theme';
import { useContentStore } from '../store/useContentStore';
import { Ionicons } from '@expo/vector-icons';

export const ContentScreen = () => {
  const { items, isLoading, fetchContent } = useContentStore();
  const { spacing, colors, layout } = useTheme();

  useEffect(() => {
    fetchContent();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'podcast': return 'mic';
      case 'video': return 'videocam';
      case 'music': return 'musical-notes';
      default: return 'play';
    }
  };

  return (
    <Screen style={{ padding: spacing.lg }}>
      <Typography variant="h1" style={{ marginBottom: spacing.lg }}>Library</Typography>

      <FlatList
        data={items}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Card style={{ marginBottom: spacing.md, padding: 0, overflow: 'hidden' }}>
            <View style={{ height: 150, backgroundColor: colors.secondary, justifyContent: 'center', alignItems: 'center' }}>
               {item.coverUrl ? (
                 <Image source={{ uri: item.coverUrl }} style={{ width: '100%', height: '100%' }} />
               ) : (
                 <Ionicons name={getIcon(item.type) as any} size={48} color={colors.surface} />
               )}
               {item.isLive && (
                 <View style={{ position: 'absolute', top: 10, right: 10, backgroundColor: 'red', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}>
                   <Typography variant="caption" color="white" weight="bold">LIVE</Typography>
                 </View>
               )}
            </View>
            <View style={{ padding: spacing.md }}>
              <Typography variant="h3">{item.title}</Typography>
              <Typography variant="caption" color={colors.textSecondary} numberOfLines={2}>
                {item.description}
              </Typography>
            </View>
          </Card>
        )}
      />
    </Screen>
  );
};
