import React, { useEffect, useState } from 'react';
import { View, FlatList, ActivityIndicator, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Screen } from '../../components/Screen';
import { Typography } from '../../components/Typography';
import { Card } from '../../components/Card';
import { useTheme } from '../../theme';
import { journeyService, JourneyTemplate } from '../../services/journeyService';
import { Ionicons } from '@expo/vector-icons';

export const JourneysCatalogScreen = () => {
  const [journeys, setJourneys] = useState<JourneyTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const { spacing, colors, layout } = useTheme();
  const navigation = useNavigation<any>();
  const { t } = useTranslation();

  useEffect(() => {
    loadJourneys();
  }, []);

  const loadJourneys = async () => {
    try {
      setLoading(true);
      const data = await journeyService.getActiveJourneys();
      setJourneys(data);
    } catch (error) {
      console.error('Failed to load journeys', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: JourneyTemplate }) => (
    <Card
      onPress={() => navigation.navigate('JourneyDetail', { journeyId: item.id })}
      style={{ marginBottom: spacing.md, padding: 0, overflow: 'hidden' }}
    >
      {item.coverImageUrl && (
        <Image 
          source={{ uri: item.coverImageUrl }} 
          style={{ width: '100%', height: 140, backgroundColor: colors.surfaceVariant }}
        />
      )}
      <View style={{ padding: spacing.md }}>
        <Typography variant="h3" style={{ marginBottom: spacing.xs }}>{item.title}</Typography>
        <Typography variant="body" color={colors.textSecondary} numberOfLines={2} style={{ marginBottom: spacing.sm }}>
          {item.descriptionShort}
        </Typography>
        
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
          {item.durationsSupported.map(d => (
            <View key={d} style={{ 
              backgroundColor: colors.surfaceVariant, 
              paddingHorizontal: spacing.sm, 
              paddingVertical: 2, 
              borderRadius: layout.radius.sm 
            }}>
              <Typography variant="caption" color={colors.textSecondary}>{d} {t('common.days')}</Typography>
            </View>
          ))}
        </View>
      </View>
    </Card>
  );

  return (
    <Screen style={{ padding: spacing.lg }}>
      <View style={{ marginBottom: spacing.lg }}>
        <Typography variant="h2">{t('journeys.title')}</Typography>
        <Typography variant="body" color={colors.textSecondary}>{t('journeys.subtitle')}</Typography>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        <FlatList
          data={journeys}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          ListEmptyComponent={
            <Typography variant="body" style={{ textAlign: 'center', marginTop: spacing.xl }}>
              {t('journeys.empty')}
            </Typography>
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </Screen>
  );
};
