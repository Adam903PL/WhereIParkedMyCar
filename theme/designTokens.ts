// theme/designTokens.ts
export const COLORS = {
  // Primary colors
  primary: {
    50: '#E3F2FD',
    100: '#BBDEFB',
    200: '#90CAF9',
    300: '#64B5F6',
    400: '#42A5F5',
    500: '#2196F3',
    600: '#1E88E5',
    700: '#1976D2',
    800: '#1565C0',
    900: '#0D47A1',
  },
  
  // Secondary colors
  secondary: {
    50: '#F3E5F5',
    100: '#E1BEE7',
    200: '#CE93D8',
    300: '#BA68C8',
    400: '#AB47BC',
    500: '#9C27B0',
    600: '#8E24AA',
    700: '#7B1FA2',
    800: '#6A1B9A',
    900: '#4A148C',
  },
  
  // Success colors
  success: {
    50: '#E8F5E8',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#66BB6A',
    500: '#4CAF50',
    600: '#43A047',
    700: '#388E3C',
    800: '#2E7D32',
    900: '#1B5E20',
  },
  
  // Error colors
  error: {
    50: '#FFEBEE',
    100: '#FFCDD2',
    200: '#EF9A9A',
    300: '#E57373',
    400: '#EF5350',
    500: '#F44336',
    600: '#E53935',
    700: '#D32F2F',
    800: '#C62828',
    900: '#B71C1C',
  },
  
  // Warning colors
  warning: {
    50: '#FFF8E1',
    100: '#FFECB3',
    200: '#FFE082',
    300: '#FFD54F',
    400: '#FFCA28',
    500: '#FFC107',
    600: '#FFB300',
    700: '#FFA000',
    800: '#FF8F00',
    900: '#FF6F00',
  },
  
  // Neutral colors
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  
  // Background colors
  background: {
    primary: '#000000',
    secondary: '#1a1a1a',
    tertiary: '#2d2d2d',
    overlay: 'rgba(0, 0, 0, 0.7)',
    blur: 'rgba(255, 255, 255, 0.1)',
  },
  
  // Text colors
  text: {
    primary: '#FFFFFF',
    secondary: 'rgba(255, 255, 255, 0.9)',
    tertiary: 'rgba(255, 255, 255, 0.7)',
    disabled: 'rgba(255, 255, 255, 0.5)',
  },

  // Timer colors
  timer: {
    background: {
      primary: 'rgba(30, 136, 229, 0.15)',
      secondary: 'rgba(16, 185, 129, 0.15)',
      warning: 'rgba(245, 158, 11, 0.15)',
      danger: 'rgba(239, 68, 68, 0.15)',
    },
    border: {
      primary: 'rgba(30, 136, 229, 0.3)',
      secondary: 'rgba(16, 185, 129, 0.3)',
      warning: 'rgba(245, 158, 11, 0.3)',
      danger: 'rgba(239, 68, 68, 0.3)',
    },
    text: {
      primary: '#1E88E5',
      secondary: '#10B981',
      warning: '#F59E0B',
      danger: '#EF4444',
    },
    accent: {
      glow: 'rgba(59, 130, 246, 0.4)',
      pulse: 'rgba(16, 185, 129, 0.6)',
    },
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const BORDER_RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 25,
  xxxl: 35,
  full: 999,
};

export const TYPOGRAPHY = {
  fontSizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 36,
    '6xl': 48,
  },
  fontWeights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
};

export const ANIMATIONS = {
  timing: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
  spring: {
    gentle: {
      damping: 20,
      stiffness: 120,
    },
    bouncy: {
      damping: 15,
      stiffness: 150,
    },
    snappy: {
      damping: 10,
      stiffness: 200,
    },
  },
};

// Component variants
export const BUTTON_VARIANTS = {
  primary: {
    colors: [COLORS.primary[500], COLORS.primary[400]],
    textColor: COLORS.text.primary,
    borderColor: 'transparent',
  },
  secondary: {
    colors: [COLORS.secondary[500], COLORS.secondary[400]],
    textColor: COLORS.text.primary,
    borderColor: 'transparent',
  },
  success: {
    colors: [COLORS.success[500], COLORS.success[400]],
    textColor: COLORS.text.primary,
    borderColor: 'transparent',
  },
  error: {
    colors: [COLORS.error[500], COLORS.error[400]],
    textColor: COLORS.text.primary,
    borderColor: 'transparent',
  },
  warning: {
    colors: [COLORS.warning[500], COLORS.warning[400]],
    textColor: COLORS.text.primary,
    borderColor: 'transparent',
  },
  ghost: {
    colors: ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)'],
    textColor: COLORS.text.primary,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
};

export const ALERT_VARIANTS = {
  success: {
    colors: [COLORS.success[600], COLORS.success[500]],
    icon: 'checkmark-circle',
  },
  error: {
    colors: [COLORS.error[600], COLORS.error[500]],
    icon: 'close-circle',
  },
  warning: {
    colors: [COLORS.warning[600], COLORS.warning[500]],
    icon: 'warning',
  },
  info: {
    colors: [COLORS.primary[600], COLORS.primary[500]],
    icon: 'information-circle',
  },
};