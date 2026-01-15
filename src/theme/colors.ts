export const colors = {
  light: {
    background: '#F9F8F6', // Soft cream/off-white
    surface: '#FFFFFF',
    primary: '#2D3436', // Dark charcoal for primary actions/text
    secondary: '#8E8E93', // Muted gray
    accent: '#D4AF37', // Muted gold for spiritual highlights
    text: '#1A1A1A',
    textSecondary: '#666666',
    border: '#E5E5EA',
    error: '#FF3B30',
    success: '#34C759',
    overlay: 'rgba(0,0,0,0.4)',
  },
  dark: {
    background: '#1C1C1E',
    surface: '#2C2C2E',
    primary: '#FFFFFF',
    secondary: '#8E8E93',
    accent: '#FFD60A',
    text: '#FFFFFF',
    textSecondary: '#EBEBF5',
    border: '#38383A',
    error: '#FF453A',
    success: '#32D74B',
    overlay: 'rgba(0,0,0,0.6)',
  },
};

export type ThemeColors = typeof colors.light;
