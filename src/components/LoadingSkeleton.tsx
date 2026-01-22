import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../theme';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  style?: ViewStyle;
  borderRadius?: number;
}

export const Skeleton = ({ width = '100%', height = 20, style, borderRadius }: SkeletonProps) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const { colors, layout } = useTheme();

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height: height as any,
          backgroundColor: colors.border,
          borderRadius: borderRadius ?? layout.radius.sm,
          opacity,
        },
        style,
      ]}
    />
  );
};

export const CardSkeleton = () => {
  const { spacing, layout } = useTheme();
  return (
    <View style={{ 
      padding: spacing.md, 
      marginBottom: spacing.md, 
      backgroundColor: 'white', 
      borderRadius: layout.radius.md,
      borderWidth: 1,
      borderColor: '#eee'
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
        <Skeleton width={40} height={40} borderRadius={20} />
        <View style={{ marginLeft: spacing.md, flex: 1 }}>
          <Skeleton width="60%" height={20} style={{ marginBottom: 6 }} />
          <Skeleton width="40%" height={14} />
        </View>
      </View>
      <Skeleton width="100%" height={100} borderRadius={layout.radius.md} />
    </View>
  );
};
