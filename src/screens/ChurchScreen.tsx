import React, { useEffect, useState } from 'react';
import { View, ScrollView, Image, ActivityIndicator, Linking, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen } from '../components/Screen';
import { Typography } from '../components/Typography';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useTheme } from '../theme';
import { useUserStore } from '../store/useUserStore';
import { churchService, Church } from '../services/churchService';
import { Ionicons } from '@expo/vector-icons';

export const ChurchScreen = () => {
  const { profile } = useUserStore();
  const [church, setChurch] = useState<Church | null>(null);
  const [updates, setUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const { spacing, colors, layout } = useTheme();
  const navigation = useNavigation<any>();

  useEffect(() => {
    const loadChurch = async () => {
      if (profile?.churchId) {
        setLoading(true);
        try {
          const [churchData, updatesData] = await Promise.all([
            churchService.getChurch(profile.churchId),
            churchService.getUpdates(profile.churchId)
          ]);
          setChurch(churchData);
          setUpdates(updatesData);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      } else {
        setChurch(null);
      }
    };
    
    loadChurch();
  }, [profile?.churchId]);

  const handleFindChurch = () => {
    navigation.navigate('Profile', { screen: 'EditChurch', params: { isEditing: true } });
  };

  const handleGive = () => {
    // In production, use church.giveUrl
    const url = 'https://www.paypal.com/donate'; 
    Linking.openURL(url).catch(err => Alert.alert('Error', 'Could not open donation page'));
  };

  const handleEvents = () => {
    // In production, use church.eventsUrl
    const url = 'https://calendar.google.com';
    Linking.openURL(url).catch(err => Alert.alert('Error', 'Could not open events page'));
  };

  if (loading) {
    return (
      <Screen style={{ justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </Screen>
    );
  }

  if (!profile?.churchId || !church) {
    return (
      <Screen style={{ padding: spacing.lg, justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ marginBottom: spacing.xl, padding: spacing.xl, backgroundColor: colors.surface, borderRadius: 100 }}>
          <Ionicons name="people" size={64} color={colors.primary} />
        </View>
        
        <Typography variant="h2" align="center" style={{ marginBottom: spacing.sm }}>
          No Church Selected
        </Typography>
        
        <Typography variant="body" align="center" color={colors.textSecondary} style={{ marginBottom: spacing.xl }}>
          Connect with your local community to see updates, events, and join group challenges.
        </Typography>

        <Button 
          title="Find My Church" 
          onPress={handleFindChurch}
          style={{ width: '100%' }}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
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
        <View style={{ flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xl }}>
          <Button 
            title="Give" 
            variant="outline" 
            style={{ flex: 1 }} 
            onPress={handleGive}
          />
          <Button 
            title="Events" 
            variant="outline" 
            style={{ flex: 1 }}
            onPress={handleEvents}
          />
        </View>

        {/* Feed Section */}
        <View>
          <Typography variant="h3" style={{ marginBottom: spacing.md }}>Latest Updates</Typography>
          
          {updates.length > 0 ? updates.map((update, index) => (
            <Card key={update.id || index} style={{ marginBottom: spacing.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
                <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: update.color || colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: spacing.sm }}>
                  <Ionicons name={update.icon as any} size={16} color={colors.surface} />
                </View>
                <View>
                  <Typography variant="h3" style={{ fontSize: 16 }}>{update.title}</Typography>
                  <Typography variant="caption" color={colors.textSecondary}>{update.date}</Typography>
                </View>
              </View>
              <Typography variant="body">
                {update.content}
              </Typography>
            </Card>
          )) : (
            <Typography variant="body" color={colors.textSecondary} style={{ fontStyle: 'italic' }}>
               No recent updates.
            </Typography>
          )}
        </View>

        <Button 
          title="Change Church" 
          variant="ghost" 
          onPress={handleFindChurch}
          style={{ marginTop: spacing.xl }}
        />
      </ScrollView>
    </Screen>
  );
};