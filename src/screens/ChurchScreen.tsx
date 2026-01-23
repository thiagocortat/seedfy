import React, { useEffect, useState } from 'react';
import { View, ScrollView, Image, ActivityIndicator, Linking, Alert, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen } from '../components/Screen';
import { Typography } from '../components/Typography';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useTheme } from '../theme';
import { useUserStore } from '../store/useUserStore';
import { churchService, Church } from '../services/churchService';
import { useChurchPostsList } from '../features/church/hooks/useChurchPosts';
import { QuickActionsGrid } from '../features/church/components/QuickActionsGrid';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

export const ChurchScreen = () => {
  const { profile } = useUserStore();
  const [church, setChurch] = useState<Church | null>(null);
  const [loadingChurch, setLoadingChurch] = useState(false);
  
  const { 
    data, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage, 
    isLoading: isLoadingPosts, 
    refetch 
  } = useChurchPostsList(profile?.churchId);

  const { spacing, colors, layout } = useTheme();
  const navigation = useNavigation<any>();
  const { t } = useTranslation();

  const posts = data?.pages.flat() || [];

  useEffect(() => {
    const loadChurch = async () => {
      if (profile?.churchId) {
        setLoadingChurch(true);
        try {
          const churchData = await churchService.getChurch(profile.churchId);
          setChurch(churchData);
        } catch (error) {
          console.error(error);
        } finally {
          setLoadingChurch(false);
        }
      } else {
        setChurch(null);
      }
    };
    
    loadChurch();
  }, [profile?.churchId]);

  const handleFindChurch = () => {
    navigation.navigate('EditChurch', { isEditing: true });
  };

  const handleGive = () => {
    // In production, use church.giveUrl
    const url = 'https://www.paypal.com/donate'; 
    Linking.openURL(url).catch(err => Alert.alert(t('common.error'), 'Could not open donation page'));
  };

  const handleEvents = () => {
    // In production, use church.eventsUrl
    const url = 'https://calendar.google.com';
    Linking.openURL(url).catch(err => Alert.alert(t('common.error'), 'Could not open events page'));
  };

  const handlePostPress = (postId: string) => {
    navigation.navigate('PostDetail', { postId });
  };

  const renderHeader = () => {
    if (!profile?.churchId || !church) {
      return (
        <View style={{ padding: spacing.lg, justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <View style={{ marginBottom: spacing.xl, padding: spacing.xl, backgroundColor: colors.surface, borderRadius: 100 }}>
            <Ionicons name="people" size={64} color={colors.primary} />
          </View>
          
          <Typography variant="h2" align="center" style={{ marginBottom: spacing.sm }}>
            {t('church.noChurchSelected')}
          </Typography>
          
          <Typography variant="body" align="center" color={colors.textSecondary} style={{ marginBottom: spacing.xl }}>
            {t('church.connectCommunity')}
          </Typography>

          <Button 
            title={t('church.findMyChurch')} 
            onPress={handleFindChurch}
            style={{ width: '100%' }}
          />
        </View>
      );
    }

    return (
      <View style={{ marginBottom: spacing.xl }}>
        {/* Church Header */}
        <View style={{ alignItems: 'center', marginBottom: spacing.xl }}>
          <View style={{ 
            width: 100, 
            height: 100, 
            borderRadius: 50, 
            backgroundColor: colors.surface, 
            justifyContent: 'center', 
            alignItems: 'center',
            marginBottom: spacing.md,
            borderWidth: 1,
            borderColor: colors.border
          }}>
            {church.logoUrl ? (
              <Image source={{ uri: church.logoUrl }} style={{ width: 100, height: 100, borderRadius: 50 }} />
            ) : (
              <Ionicons name="business" size={48} color={colors.textSecondary} />
            )}
          </View>
          
          <Typography variant="h1" align="center" style={{ marginBottom: spacing.xs }}>
            {church.name}
          </Typography>
          
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="location-outline" size={16} color={colors.textSecondary} style={{ marginRight: 4 }} />
            <Typography variant="body" color={colors.textSecondary}>
              {church.city}, {church.state}
            </Typography>
          </View>
        </View>

        {/* Quick Actions */}
        <QuickActionsGrid churchId={profile?.churchId} />

        <Typography variant="h3" style={{ marginBottom: spacing.md }}>{t('church.latestUpdates')}</Typography>
      </View>
    );
  };

  const renderFooter = () => {
    if (!profile?.churchId) return null;
    
    return (
      <View style={{ paddingVertical: spacing.xl }}>
        {isFetchingNextPage && <ActivityIndicator color={colors.primary} />}
        <Button 
          title={t('church.changeChurch')} 
          variant="ghost" 
          onPress={handleFindChurch}
          style={{ marginTop: spacing.lg }}
        />
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoadingPosts || loadingChurch) return <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.xl }} />;
    if (!profile?.churchId) return null; // Header handles empty state for no church

    return (
      <Typography variant="body" color={colors.textSecondary} style={{ fontStyle: 'italic', textAlign: 'center', marginTop: spacing.xl }}>
         {t('church.noUpdates')}
      </Typography>
    );
  };

  return (
    <Screen>
      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={{ padding: spacing.lg }}
        onEndReached={() => {
          if (hasNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        refreshing={isLoadingPosts && !isFetchingNextPage}
        onRefresh={refetch}
        renderItem={({ item }) => (
          <Card style={{ marginBottom: spacing.md }} onPress={() => handlePostPress(item.id)}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
              <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: spacing.sm }}>
                <Ionicons name="megaphone" size={16} color={colors.surface} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h3" style={{ fontSize: 16, flex: 1 }} numberOfLines={1}>{item.title}</Typography>
                  {item.pinned && <Ionicons name="pin" size={14} color={colors.primary} />}
                </View>
                <Typography variant="caption" color={colors.textSecondary}>{new Date(item.published_at).toLocaleDateString()}</Typography>
              </View>
            </View>
            
            {item.image_url && (
              <Image 
                source={{ uri: item.image_url }} 
                style={{ width: '100%', height: 150, borderRadius: 8, marginBottom: spacing.sm }} 
                resizeMode="cover"
              />
            )}

            <Typography variant="body" numberOfLines={3}>
              {item.excerpt || item.body}
            </Typography>
          </Card>
        )}
      />
    </Screen>
  );
};