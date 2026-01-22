import React, { useEffect } from 'react';
import { View, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen } from '../components/Screen';
import { Typography } from '../components/Typography';
import { Card } from '../components/Card';
import { useTheme } from '../theme';
import { useContentStore } from '../store/useContentStore';
import { Ionicons } from '@expo/vector-icons';
import { ContentItem } from '../services/contentService';
import { useTranslation } from 'react-i18next';

export const ContentScreen = () => {
  const { items, isLoading, fetchContent } = useContentStore();
  const { spacing, colors } = useTheme();
  const navigation = useNavigation<any>();
  const { t } = useTranslation();

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

  const handlePlay = (item: ContentItem) => {
    navigation.navigate('Player', { item });
  };

  const renderItem = ({ item }: { item: ContentItem }) => {
    return (
      <Card style={{ marginBottom: spacing.md, padding: 0, overflow: 'hidden' }}>
        <TouchableOpacity 
          onPress={() => handlePlay(item)}
          activeOpacity={0.9}
        >
          <View style={{ height: 200, backgroundColor: colors.secondary, justifyContent: 'center', alignItems: 'center' }}>
            {item.coverUrl ? (
              <Image source={{ uri: item.coverUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
            ) : (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                 <Ionicons name={getIcon(item.type) as any} size={64} color={colors.surface} />
              </View>
            )}
            
            {/* Overlay Play Icon */}
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }]}>
              <Ionicons 
                name="play-circle" 
                size={64} 
                color="white" 
                style={{ opacity: 0.9 }}
              />
            </View>

            {item.isLive && (
              <View style={{ position: 'absolute', top: 10, right: 10, backgroundColor: '#ef4444', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}>
                <Typography variant="caption" color="white" weight="bold">{t('content.live')}</Typography>
              </View>
            )}
            
            {/* Type Badge */}
            <View style={{ position: 'absolute', top: 10, left: 10, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}>
              <Typography variant="caption" color="white" weight="bold">{item.type.toUpperCase()}</Typography>
            </View>
          </View>

          <View style={{ padding: spacing.md }}>
            <Typography variant="h3">{item.title}</Typography>
            <Typography variant="caption" color={colors.textSecondary} numberOfLines={2} style={{ marginTop: 4 }}>
              {item.description}
            </Typography>
          </View>
        </TouchableOpacity>
      </Card>
    );
  };

  return (
    <Screen style={{ padding: spacing.md }}>
      <Typography variant="h1" style={{ marginBottom: spacing.lg, marginHorizontal: spacing.xs }}>
        {t('content.library')}
      </Typography>

      <FlatList
        data={items}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
};
