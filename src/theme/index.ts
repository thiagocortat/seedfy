import { useColorScheme } from 'react-native';
import { colors } from './colors';
import { typography } from './typography';
import { spacing, layout } from './spacing';

export const theme = {
  colors,
  typography,
  spacing,
  layout,
};

export const useTheme = () => {
  const colorScheme = useColorScheme();
  const currentColors = colors[colorScheme === 'dark' ? 'dark' : 'light'];
  
  return {
    colors: currentColors,
    typography,
    spacing,
    layout,
    isDark: colorScheme === 'dark',
  };
};
