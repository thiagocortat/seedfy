import React from 'react';
import { View, ScrollView, Image, ActivityIndicator, Linking, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Screen } from '../../components/Screen';
import { Typography } from '../../components/Typography';
import { Button } from '../../components/Button';
import { useTheme } from '../../theme';
import { usePostDetail } from './hooks/useChurchPosts';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

export const PostDetailScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { postId } = route.params;
  const { spacing, colors } = useTheme();
  const { t } = useTranslation();
  
  const { data: post, isLoading, error } = usePostDetail(postId);

  if (isLoading) {
    return (
      <Screen style={{ justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </Screen>
    );
  }

  if (error || !post) {
    return (
      <Screen style={{ padding: spacing.lg, justifyContent: 'center', alignItems: 'center' }}>
        <Typography variant="h3" align="center" style={{ marginBottom: spacing.md }}>
          {t('common.error')}
        </Typography>
        <Button title={t('common.back')} onPress={() => navigation.goBack()} />
      </Screen>
    );
  }

  const handleOpenLink = () => {
    if (post.link_url) {
      Linking.openURL(post.link_url).catch(err => console.error("Couldn't load page", err));
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xl }}>
        {post.image_url && (
          <Image 
            source={{ uri: post.image_url }} 
            style={{ width: '100%', height: 250 }} 
            resizeMode="cover"
          />
        )}
        
        <View style={{ padding: spacing.lg }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm }}>
            <Typography variant="caption" color={colors.textSecondary}>
              {new Date(post.published_at).toLocaleDateString()}
            </Typography>
            {post.pinned && (
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: colors.border }}>
                <Ionicons name="pin" size={12} color={colors.primary} style={{ marginRight: 4 }} />
                <Typography variant="caption" color={colors.primary} weight="bold">Fixed</Typography>
              </View>
            )}
          </View>

          <Typography variant="h1" style={{ marginBottom: spacing.md }}>
            {post.title}
          </Typography>

          {post.body ? (
            <Typography variant="body" style={{ lineHeight: 24 }}>
              {post.body}
            </Typography>
          ) : post.excerpt ? (
             <Typography variant="body" style={{ lineHeight: 24 }}>
              {post.excerpt}
            </Typography>
          ) : null}

          {post.link_url && (
            <Button 
              title="Learn More" // TODO: Add to translations
              onPress={handleOpenLink}
              style={{ marginTop: spacing.xl }}
              icon={<Ionicons name="open-outline" size={20} color="white" style={{ marginRight: 8 }} />}
            />
          )}
        </View>
      </ScrollView>
    </Screen>
  );
};
