// utils/ui.ts
import { ViewStyle, TextStyle } from 'react-native';
import {
  BORDER_RADIUS,
  COLORS,
  SHADOWS,
  SPACING,
  TYPOGRAPHY,
} from '../theme/designTokens';

// Common style generators
export const createShadow = (level: 'small' | 'medium' | 'large' | 'xl' = 'medium') => {
  return SHADOWS[level];
};

export const createPadding = (
  vertical: keyof typeof SPACING,
  horizontal: keyof typeof SPACING
): ViewStyle => ({
  paddingVertical: SPACING[vertical],
  paddingHorizontal: SPACING[horizontal],
});

export const createMargin = (
  vertical: keyof typeof SPACING,
  horizontal: keyof typeof SPACING
): ViewStyle => ({
  marginVertical: SPACING[vertical],
  marginHorizontal: SPACING[horizontal],
});

export const createBorderRadius = (size: keyof typeof BORDER_RADIUS): ViewStyle => ({
  borderRadius: BORDER_RADIUS[size],
});

export const createGlassEffect = (intensity: number = 0.1): ViewStyle => ({
  backgroundColor: `rgba(255, 255, 255, ${intensity})`,
  borderWidth: 1,
  borderColor: `rgba(255, 255, 255, ${intensity * 2})`,
  ...createShadow('medium'),
});

export const createGradientOverlay = (opacity: number = 0.7): ViewStyle => ({
  backgroundColor: `rgba(0, 0, 0, ${opacity})`,
});

// Text style generators
export const createTextStyle = (
  size: keyof typeof TYPOGRAPHY.fontSizes,
  weight: keyof typeof TYPOGRAPHY.fontWeights,
  color: string = COLORS.text.primary
): TextStyle => ({
  fontSize: TYPOGRAPHY.fontSizes[size],
  fontWeight: TYPOGRAPHY.fontWeights[weight] as any,
  color,
});

export const createTextShadow = (
  color: string = 'rgba(0, 0, 0, 0.3)',
  offset: { width: number; height: number } = { width: 0, height: 1 },
  radius: number = 2
): TextStyle => ({
  textShadowColor: color,
  textShadowOffset: offset,
  textShadowRadius: radius,
});

// Animation helpers
export const createScaleAnimation = (scale: number = 0.95) => ({
  transform: [{ scale }],
});

export const createFadeAnimation = (opacity: number = 0.8) => ({
  opacity,
});

// Layout helpers
export const centerContent: ViewStyle = {
  justifyContent: 'center',
  alignItems: 'center',
};

export const flexRow: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
};

export const flexColumn: ViewStyle = {
  flexDirection: 'column',
};

export const fullWidth: ViewStyle = {
  width: '100%',
};

export const fullHeight: ViewStyle = {
  height: '100%',
};

export const absoluteFill: ViewStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
};

// Color utilities
export const withOpacity = (color: string, opacity: number): string => {
  // Handle hex colors
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  
  // Handle rgba colors
  if (color.startsWith('rgba')) {
    return color.replace(/[\d\.]+\)$/g, `${opacity})`);
  }
  
  // Handle rgb colors
  if (color.startsWith('rgb')) {
    return color.replace('rgb', 'rgba').replace(')', `, ${opacity})`);
  }
  
  return color;
};

// Responsive utilities
export const createResponsivePadding = (
  screenWidth: number,
  basePadding: keyof typeof SPACING = 'md'
): number => {
  const base = SPACING[basePadding];
  if (screenWidth < 375) return base * 0.8;
  if (screenWidth > 414) return base * 1.2;
  return base;
};

export const createResponsiveFontSize = (
  screenWidth: number,
  baseFontSize: keyof typeof TYPOGRAPHY.fontSizes = 'base'
): number => {
  const base = TYPOGRAPHY.fontSizes[baseFontSize];
  if (screenWidth < 375) return base * 0.9;
  if (screenWidth > 414) return base * 1.1;
  return base;
};

// Theme helpers
export const getStatusColor = (status: 'success' | 'error' | 'warning' | 'info') => {
  switch (status) {
    case 'success':
      return COLORS.success[500];
    case 'error':
      return COLORS.error[500];
    case 'warning':
      return COLORS.warning[500];
    case 'info':
      return COLORS.primary[500];
    default:
      return COLORS.primary[500];
  }
};

export const getContrastColor = (backgroundColor: string): string => {
  // Simple contrast calculation - in production, you might want a more sophisticated solution
  const isLight = backgroundColor.includes('255, 255, 255') || 
                  backgroundColor.includes('#fff') || 
                  backgroundColor.includes('#FFF');
  
  return isLight ? COLORS.text.primary : COLORS.background.primary;
};

// Component style presets
export const buttonPresets = {
  primary: {
    ...createPadding('lg', 'xl'),
    ...createBorderRadius('xxl'),
    ...createShadow('large'),
  },
  secondary: {
    ...createPadding('md', 'lg'),
    ...createBorderRadius('xl'),
    ...createShadow('medium'),
  },
  small: {
    ...createPadding('sm', 'md'),
    ...createBorderRadius('lg'),
    ...createShadow('small'),
  },
};

export const cardPresets = {
  default: {
    ...createPadding('lg', 'lg'),
    ...createBorderRadius('xl'),
    ...createShadow('medium'),
    backgroundColor: withOpacity(COLORS.neutral[900], 0.9),
    borderWidth: 1,
    borderColor: withOpacity(COLORS.neutral[700], 0.5),
  },
  glass: {
    ...createPadding('lg', 'lg'),
    ...createBorderRadius('xl'),
    ...createGlassEffect(0.1),
  },
  floating: {
    ...createPadding('xl', 'xl'),
    ...createBorderRadius('xxl'),
    ...createShadow('xl'),
    backgroundColor: withOpacity(COLORS.background.secondary, 0.95),
  },
};

// Animation presets
export const animationPresets = {
  bounce: {
    damping: 15,
    stiffness: 150,
  },
  gentle: {
    damping: 20,
    stiffness: 120,
  },
  snappy: {
    damping: 10,
    stiffness: 200,
  },
};

// Accessibility helpers
export const createAccessibilityProps = (
  label: string,
  hint?: string,
  role?: string
) => ({
  accessibilityLabel: label,
  accessibilityHint: hint,
  accessibilityRole: role as any,
});

export const focusableProps = {
  accessible: true,
  focusable: true,
};

// Validation helpers for theme consistency
export const validateThemeColor = (color: string): boolean => {
  const allColors = Object.values(COLORS).flatMap(colorGroup => 
    typeof colorGroup === 'object' ? Object.values(colorGroup) : [colorGroup]
  );
  return allColors.includes(color);
};

export const validateSpacing = (spacing: number): boolean => {
  return Object.values(SPACING).includes(spacing);
};

export const validateBorderRadius = (radius: number): boolean => {
  return Object.values(BORDER_RADIUS).includes(radius);
};

// Debug helpers (development only)
export const debugStyle = (label: string): ViewStyle => ({
  borderWidth: 1,
  borderColor: 'red',
  backgroundColor: 'rgba(255, 0, 0, 0.1)',
  // You can add this as a prop to any component during development
});

export const debugLog = (componentName: string, props: any) => {
  if (__DEV__) {
    console.log(`[${componentName}] Props:`, props);
  }
};