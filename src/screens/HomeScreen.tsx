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
import { Ionicons } from '@expo/vector-icons';

export const HomeScreen = () => {
  const { user } = useAuthStore();
  const { profile } = useUserStore();
  const { challenges, fetchUserChallenges } = useChallengeStore();
  const { featured, fetchContent } = useContentStore();
  const { spacing, colors, layout } = useTheme();
  const navigation = useNavigation<any>();

  useEffect(() => {
    if (user) {
      fetchUserChallenges(user.id);
      fetchContent();
    }
  }, [user]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 100 }}>
        {/* Header */}
        <View style={{ marginBottom: spacing.xl, marginTop: spacing.md }}>
          <Typography variant="h2">{greeting()},</Typography>
          <Typography variant="h1">{profile?.name || 'Friend'}</Typography>
          <Typography variant="caption" color={colors.textSecondary} style={{ marginTop: spacing.xs }}>
            "This is the day that the Lord has made."
          </Typography>
        </View>

        {/* Active Challenges Carousel */}
        <View style={{ marginBottom: spacing.xl }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
            <Typography variant="h3">Active Challenges</Typography>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <TouchableOpacity onPress={() => navigation.navigate('Challenges', { screen: 'CreateChallenge' })}>
                <Ionicons name="add-circle" size={24} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('Challenges')}>
                <Typography variant="caption" color={colors.primary}>View All</Typography>
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
                  onPress={() => navigation.navigate('Challenges', { screen: 'ChallengeDetail', params: { challengeId: item.id } })}
                  style={{ width: 260, marginRight: spacing.md, height: 160, justifyContent: 'space-between' }}
                >
                  <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs }}>
                      <Ionicons name="trophy" size={16} color={colors.accent} style={{ marginRight: spacing.xs }} />
                      <Typography variant="label" color={colors.textSecondary}>{item.type.toUpperCase()}</Typography>
                    </View>
                    <Typography variant="h3" numberOfLines={2}>{item.title}</Typography>
                  </View>
                  
                  <View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color={colors.textSecondary}>
                        Ends {new Date(item.endDate).toLocaleDateString()}
                      </Typography>
                      <View style={{ backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 }}>
                         <Typography variant="caption" color={colors.surface} weight="bold">Continue</Typography>
                      </View>
                    </View>
                  </View>
                </Card>
              )}
            />
          ) : (
            <Card style={{ padding: spacing.lg, alignItems: 'center' }}>
              <Typography variant="body" color={colors.textSecondary} align="center" style={{ marginBottom: spacing.md }}>
                Start a journey with your friends.
              </Typography>
              <TouchableOpacity onPress={() => navigation.navigate('Challenges', { screen: 'CreateChallenge' })}>
                <Typography variant="label" color={colors.primary}>Start a Challenge</Typography>
              </TouchableOpacity>
            </Card>
          )}
        </View>

        {/* Featured Content */}
        <View style={{ marginBottom: spacing.xl }}>
          <Typography variant="h3" style={{ marginBottom: spacing.md }}>Featured for You</Typography>
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
           <Typography variant="h3" style={{ marginBottom: spacing.md }}>From Your Church</Typography>
           {profile?.churchId ? (
             <Card>
               <Typography variant="body" color={colors.textSecondary} style={{ fontStyle: 'italic' }}>
                 No recent updates from your church.
               </Typography>
             </Card>
           ) : (
             <Card onPress={() => navigation.navigate('Profile', { screen: 'EditChurch', params: { isEditing: true } })}>
               <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                 <Ionicons name="add-circle-outline" size={24} color={colors.primary} style={{ marginRight: spacing.sm }} />
                 <Typography variant="body">Select your church to see updates</Typography>
               </View>
             </Card>
           )}
        </View>
      </ScrollView>
    </Screen>
  );
};
