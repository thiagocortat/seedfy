import React from 'react';
import { View, TouchableOpacity, Linking, ToastAndroid, Platform, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme';
import { Typography } from '../../../components/Typography';
import { useChurchQuickActions } from '../hooks/useChurchQuickActions';
import { QuickAction } from '../../../services/churchQuickActionsService';

interface Props {
  churchId: string;
}

const ICON_MAP: Record<string, any> = {
  donate: 'heart',
  events: 'calendar',
  website: 'globe',
  whatsapp: 'logo-whatsapp',
  youtube: 'logo-youtube',
  instagram: 'logo-instagram',
  default: 'link'
};

export const QuickActionsGrid = ({ churchId }: Props) => {
  const { data: actions, isLoading } = useChurchQuickActions(churchId);
  const { spacing, colors, layout } = useTheme();
  const navigation = useNavigation<any>();

  if (isLoading || !actions || actions.length === 0) return null;

  const handlePress = (action: QuickAction) => {
    if (!action.url.startsWith('http')) {
      const message = 'Invalid URL configuration';
      if (Platform.OS === 'android') {
        ToastAndroid.show(message, ToastAndroid.SHORT);
      } else {
        Alert.alert('Error', message);
      }
      return;
    }

    if (action.open_mode === 'in_app') {
      navigation.navigate('WebView', { url: action.url, title: action.label });
    } else {
      Linking.openURL(action.url).catch(err => {
        Alert.alert('Error', 'Could not open link');
      });
    }
  };

  const renderButton = (action: QuickAction, isFullWidth: boolean) => {
    const iconName = ICON_MAP[action.type] || ICON_MAP.default;
    
    return (
      <TouchableOpacity
        key={action.id}
        onPress={() => handlePress(action)}
        style={{
          flexBasis: isFullWidth ? '100%' : '48%',
          backgroundColor: colors.surface,
          borderRadius: layout.radius.md,
          padding: spacing.md,
          marginBottom: spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: colors.primary,
          minHeight: 48
        }}
      >
        <Ionicons name={iconName} size={20} color={colors.primary} style={{ marginRight: spacing.sm }} />
        <Typography variant="label" color={colors.primary} numberOfLines={1}>
          {action.label}
        </Typography>
      </TouchableOpacity>
    );
  };

  // If 1-3 items, display as list (full width)
  // If 4-6 items, display as grid (2 columns)
  const isGrid = actions.length > 3;

  return (
    <View style={{ 
      flexDirection: 'row', 
      flexWrap: 'wrap', 
      justifyContent: 'space-between',
      marginBottom: spacing.lg 
    }}>
      {actions.map(action => renderButton(action, !isGrid))}
    </View>
  );
};
