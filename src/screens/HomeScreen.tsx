import React, { useEffect } from 'react';
import { View, ScrollView, FlatList, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen } from '../components/Screen';
import { Typography } from '../components/Typography';
import { Card } from '../components/Card';
import { useTheme } from '../theme';
import { useAuthStore } from '../store/useAuthStore';
import { useUserStore } from '../store/useUserStore';
import { useChallengeStore } from '../store/useChallengeStore';
import { useContentStore } from '../store/useContentStore';
import { useChurchPostsPreview } from '../features/church/hooks/useChurchPosts';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

export const HomeScreen = () => {
  const { user } = useAuthStore();
  const { profile } = useUserStore();
  const { challenges, fetchUserChallenges } = useChallengeStore();
  const { featured, fetchContent } = useContentStore();
  const { data: churchPosts, isLoading: isLoadingPosts, error: postsError } = useChurchPostsPreview(profile?.churchId);
  
  const { spacing, colors, layout } = useTheme();
  const navigation = useNavigation<any>();
  const { t } = useTranslation();

  useEffect(() => {
    if (user) {
      fetchUserChallenges(user.id);
      fetchContent();
    }
  }, [user]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('home.goodMorning');
    if (hour < 18) return t('home.goodAfternoon');
    return t('home.goodEvening');
  };

  const handlePostPress = (postId: string) => {
    // Navigate to Church tab then to detail
    navigation.navigate('Church', { screen: 'PostDetail', params: { postId } });
  };

  const handleViewAllPosts = () => {
    navigation.navigate('Church');
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 100 }}>
        {/* Header */}
        <View style={{ marginBottom: spacing.xl, marginTop: spacing.md }}>
          <Typography variant="h2">{greeting()},</Typography>
          <Typography variant="h1">{profile?.name || t('home.friend')}</Typography>
          <Typography variant="caption" color={colors.textSecondary} style={{ marginTop: spacing.xs }}>
            "{t('home.verseOfTheDay')}"
          </Typography>
        </View>

        {/* Active Challenges Carousel */}
        <View style={{ marginBottom: spacing.xl }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
            <Typography variant="h3">{t('home.activeChallenges')}</Typography>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <TouchableOpacity onPress={() => navigation.navigate('Challenges', { screen: 'CreateChallenge' })}>
                <Ionicons name="add-circle" size={24} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('Challenges')}>
                <Typography variant="caption" color={colors.primary}>{t('common.viewAll')}</Typography>
              </TouchableOpacity>
            </View>
          </View>

          {challenges.length > 0 ? (
            <FlatList
              horizontal
              data={challenges}
              showsHorizontalScrollIndicator={false}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <Card 
                  onPress={() => {
                    if (item.journeyId) {
                      navigation.navigate('Challenges', { screen: 'ChallengeJourney', params: { challenge: item } });
                    } else {
                      navigation.navigate('Challenges', { screen: 'ChallengeDetail', params: { challengeId: item.id } });
                    }
                  }}
                  style={{ width: 260, marginRight: spacing.md, height: 160, justifyContent: 'space-between' }}
                >
                  <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs }}>
                      <Ionicons name="trophy" size={16} color={colors.accent} style={{ marginRight: spacing.xs }} />
                      <Typography variant="label" color={colors.textSecondary}>
                         {t(`challenges.types.${item.type}`, { defaultValue: item.type.toUpperCase() })}
                      </Typography>
                    </View>
                    <Typography variant="h3" numberOfLines={2}>{item.title}</Typography>
                  </View>
                  
                  <View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color={colors.textSecondary}>
                         {t('common.finish')} {new Date(item.endDate).toLocaleDateString()}
                      </Typography>
                      <View style={{ backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 }}>
                         <Typography variant="caption" color={colors.surface} weight="bold">{t('common.continue')}</Typography>
                      </View>
                    </View>
                  </View>
                </Card>
              )}
            />
          ) : (
            <Card style={{ padding: spacing.lg, alignItems: 'center' }}>
              <Typography variant="body" color={colors.textSecondary} align="center" style={{ marginBottom: spacing.md }}>
                {t('home.startJourney')}
              </Typography>
              <TouchableOpacity onPress={() => navigation.navigate('Challenges', { screen: 'CreateChallenge' })}>
                <Typography variant="label" color={colors.primary}>{t('home.startChallenge')}</Typography>
              </TouchableOpacity>
            </Card>
          )}
        </View>

        {/* Featured Content */}
        <View style={{ marginBottom: spacing.xl }}>
          <Typography variant="h3" style={{ marginBottom: spacing.md }}>{t('home.featuredForYou')}</Typography>
          <FlatList
            horizontal
            data={featured}
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={{ width: 140, marginRight: spacing.md }}
                onPress={() => navigation.navigate('Player', { item })}
              >
                <View style={{ height: 140, backgroundColor: colors.secondary, borderRadius: layout.radius.md, marginBottom: spacing.sm, overflow: 'hidden' }}>
                  {item.coverUrl ? (
                    <Image source={{ uri: item.coverUrl }} style={{ width: '100%', height: '100%' }} />
                  ) : (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                      <Ionicons name="play" size={32} color={colors.surface} />
                    </View>
                  )}
                </View>
                <Typography variant="label" numberOfLines={2}>{item.title}</Typography>
                <Typography variant="caption" color={colors.textSecondary}>{item.type}</Typography>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Church Updates Preview */}
        <View>
           <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
             <Typography variant="h3">{t('home.fromYourChurch')}</Typography>
             {profile?.churchId && (
               <TouchableOpacity onPress={handleViewAllPosts}>
                 <Typography variant="caption" color={colors.primary}>{t('common.viewAll')}</Typography>
               </TouchableOpacity>
             )}
           </View>

           {profile?.churchId ? (
             churchPosts && churchPosts.length > 0 ? (
               churchPosts.map((post) => (
                 <Card key={post.id} style={{ marginBottom: spacing.md }} onPress={() => handlePostPress(post.id)}>
                   <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
                     <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: spacing.sm }}>
                       <Ionicons name="megaphone" size={16} color={colors.surface} />
                     </View>
                     <View>
                       <Typography variant="h3" style={{ fontSize: 16 }}>{post.title}</Typography>
                       <Typography variant="caption" color={colors.textSecondary}>
                         {new Date(post.published_at).toLocaleDateString()}
                       </Typography>
                     </View>
                   </View>
                   <Typography variant="body" numberOfLines={2}>
                     {post.excerpt || post.title}
                   </Typography>
                 </Card>
               ))
             ) : (
               <Card>
                 <Typography variant="body" color={colors.textSecondary} style={{ fontStyle: 'italic' }}>
                   {t('home.noChurchUpdates')}
                 </Typography>
               </Card>
             )
           ) : (
             <Card onPress={() => navigation.navigate('Profile', { screen: 'EditChurch', params: { isEditing: true } })}>
               <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                 <Ionicons name="add-circle-outline" size={24} color={colors.primary} style={{ marginRight: spacing.sm }} />
                 <Typography variant="body">{t('home.selectChurch')}</Typography>
               </View>
             </Card>
           )}
        </View>
      </ScrollView>
    </Screen>
  );
};
