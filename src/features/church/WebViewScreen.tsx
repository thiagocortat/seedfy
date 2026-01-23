import React, { useLayoutEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Screen } from '../../components/Screen';
import { useTheme } from '../../theme';

export const WebViewScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { url, title } = route.params;
  const { colors } = useTheme();

  useLayoutEffect(() => {
    navigation.setOptions({ title: title || 'WebView' });
  }, [navigation, title]);

  return (
    <Screen style={{ padding: 0 }}>
      <WebView 
        source={{ uri: url }} 
        startInLoadingState
        renderLoading={() => (
          <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}
      />
    </Screen>
  );
};
