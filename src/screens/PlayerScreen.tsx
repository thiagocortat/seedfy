import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Image, TouchableOpacity, Dimensions, ActivityIndicator, StyleSheet } from 'react-native';
import { Video, ResizeMode, Audio, AVPlaybackStatus } from 'expo-av';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { Screen } from '../components/Screen';
import { Typography } from '../components/Typography';
import { useTheme } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { ContentItem } from '../services/contentService';
import Slider from '@react-native-community/slider';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

export const PlayerScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { item } = route.params as { item: ContentItem };
  const { spacing, colors } = useTheme();
  const { t } = useTranslation();

  const videoRef = useRef<Video>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(1); // Avoid div by zero

  const isVideo = item.type === 'video';
  const soundRef = useRef<Audio.Sound | null>(null);

  // Sync ref with state for cleanup access
  useEffect(() => {
    soundRef.current = sound;
  }, [sound]);

  useFocusEffect(
    useCallback(() => {
      // Setup
      Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });

      if (!isVideo) {
        loadAudio();
      } else {
        setIsLoading(false);
      }

      return () => {
        // Cleanup on blur (screen close/navigate away)
        if (soundRef.current) {
          console.log('Unloading sound on blur...');
          soundRef.current.stopAsync().then(() => {
            soundRef.current?.unloadAsync();
          });
        }
        if (videoRef.current) {
          videoRef.current.stopAsync();
        }
      };
    }, [])
  );

  const loadAudio = async () => {
    try {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: item.mediaUrl },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );
      setSound(newSound);
      setIsPlaying(true);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading audio:', error);
      setIsLoading(false);
    }
  };

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis || 1);
      setIsPlaying(status.isPlaying);
      if (status.didJustFinish) {
        setIsPlaying(false);
        setPosition(0);
      }
    }
  };

  const togglePlayback = async () => {
    if (isVideo && videoRef.current) {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
      setIsPlaying(!isPlaying);
    } else if (sound) {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
    }
  };

  const handleSeek = async (value: number) => {
    if (isVideo && videoRef.current) {
      await videoRef.current.setPositionAsync(value);
    } else if (sound) {
      await sound.setPositionAsync(value);
    }
  };

  const formatTime = (millis: number) => {
    const minutes = Math.floor(millis / 60000);
    const seconds = ((millis % 60000) / 1000).toFixed(0);
    return `${minutes}:${Number(seconds) < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <Screen style={{ backgroundColor: 'black', justifyContent: 'center' }}>
      {/* Header Close Button */}
      <TouchableOpacity 
        style={{ position: 'absolute', top: 50, left: 20, zIndex: 10, padding: 8, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20 }}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="chevron-down" size={32} color="white" />
      </TouchableOpacity>

      {/* Media Content */}
      <View style={{ flex: 1, justifyContent: 'center' }}>
        {isVideo ? (
          <Video
            ref={videoRef}
            source={{ uri: item.mediaUrl }}
            style={{ width: width, height: width * (9/16) }}
            useNativeControls={false} // Custom controls below
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay
            onPlaybackStatusUpdate={onPlaybackStatusUpdate}
          />
        ) : (
          <View style={{ alignItems: 'center', marginBottom: 40 }}>
            <Image 
              source={{ uri: item.coverUrl || 'https://via.placeholder.com/300' }} 
              style={{ width: width - 80, height: width - 80, borderRadius: 20 }} 
            />
          </View>
        )}
      </View>

      {/* Controls Container */}
      <View style={{ padding: spacing.xl, paddingBottom: 60 }}>
        <Typography variant="h2" color="white" align="center" style={{ marginBottom: spacing.xs }}>
          {item.title}
        </Typography>
        <Typography variant="body" color="#aaaaaa" align="center" style={{ marginBottom: spacing.xl }}>
          {item.description}
        </Typography>

        {/* Progress Bar */}
        <View style={{ marginBottom: spacing.lg }}>
          <Slider
            style={{ width: '100%', height: 40 }}
            minimumValue={0}
            maximumValue={duration}
            value={position}
            onSlidingComplete={handleSeek}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor="#555"
            thumbTintColor={colors.primary}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Typography variant="caption" color="#aaaaaa">{formatTime(position)}</Typography>
            <Typography variant="caption" color="#aaaaaa">{formatTime(duration)}</Typography>
          </View>
        </View>

        {/* Playback Buttons */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 40 }}>
          <TouchableOpacity onPress={() => handleSeek(Math.max(0, position - 15000))}>
            <Ionicons name="play-back" size={32} color="white" />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={togglePlayback}
            style={{ 
              width: 80, 
              height: 80, 
              borderRadius: 40, 
              backgroundColor: colors.primary, 
              justifyContent: 'center', 
              alignItems: 'center' 
            }}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Ionicons name={isPlaying ? "pause" : "play"} size={40} color="white" style={{ marginLeft: isPlaying ? 0 : 4 }} />
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleSeek(Math.min(duration, position + 15000))}>
            <Ionicons name="play-forward" size={32} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </Screen>
  );
};
