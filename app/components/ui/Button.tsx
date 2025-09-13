// components/ui/Button.tsx
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {
  ANIMATIONS,
  BORDER_RADIUS,
  BUTTON_VARIANTS,
  SHADOWS,
  SPACING,
  TYPOGRAPHY,
} from '../../../theme/designTokens';

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          paddingHorizontal: SPACING.md,
          paddingVertical: SPACING.sm,
          minWidth: 120,
          borderRadius: BORDER_RADIUS.lg,
        };
      case 'md':
        return {
          paddingHorizontal: SPACING.lg,
          paddingVertical: SPACING.md,
          minWidth: 160,
          borderRadius: BORDER_RADIUS.xl,
        };
      case 'lg':
        return {
          paddingHorizontal: SPACING.xl,
          paddingVertical: SPACING.lg,
          minWidth: 200,
          borderRadius: BORDER_RADIUS.xxl,
        };
      case 'xl':
        return {
          paddingHorizontal: SPACING.xl,
          paddingVertical: SPACING.lg + SPACING.xs,
          minWidth: 260,
          borderRadius: BORDER_RADIUS.xxxl,
        };
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'sm':
        return TYPOGRAPHY.fontSizes.sm;
      case 'md':
        return TYPOGRAPHY.fontSizes.base;
      case 'lg':
        return TYPOGRAPHY.fontSizes.lg;
      case 'xl':
        return TYPOGRAPHY.fontSizes.lg;
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 16;
      case 'md':
        return 20;
      case 'lg':
        return 24;
      case 'xl':
        return 28;
    }
  };

  const handlePressIn = () => {
    scale.value = withSpring(0.95, ANIMATIONS.spring.bouncy);
    opacity.value = withSpring(0.8);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, ANIMATIONS.spring.bouncy);
    opacity.value = withSpring(1);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const variantConfig = BUTTON_VARIANTS[variant];
  const sizeStyles = getSizeStyles();
  const textSize = getTextSize();
  const iconSize = getIconSize();

  const isDisabled = disabled || loading;

  return (
    <Animated.View style={[styles.container, animatedStyle, fullWidth && styles.fullWidth]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        activeOpacity={1}
        style={[styles.touchable, isDisabled && styles.disabled]}
      >
        <LinearGradient
          colors={variantConfig.colors as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.gradient,
            sizeStyles,
            variant === 'ghost' && {
              borderWidth: 1,
              borderColor: variantConfig.borderColor,
            },
            fullWidth && styles.fullWidth,
            style,
          ]}
        >
          {icon && iconPosition === 'left' && (
            <Ionicons
              name={icon}
              size={iconSize}
              color={variantConfig.textColor}
              style={styles.iconLeft}
            />
          )}
          
          <Text
            style={[
              styles.text,
              {
                color: variantConfig.textColor,
                fontSize: textSize,
              },
            ]}
          >
            {loading ? 'Loading...' : title}
          </Text>
          
          {icon && iconPosition === 'right' && (
            <Ionicons
              name={icon}
              size={iconSize}
              color={variantConfig.textColor}
              style={styles.iconRight}
            />
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'visible',
  },
  touchable: {
    borderRadius: BORDER_RADIUS.xxxl,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.large,
  },
  text: {
    fontWeight: TYPOGRAPHY.fontWeights.extrabold as any,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  } as TextStyle,
  iconLeft: {
    marginRight: SPACING.sm,
  },
  iconRight: {
    marginLeft: SPACING.sm,
  },
  disabled: {
    opacity: 0.6,
  },
  fullWidth: {
    width: '100%',
  },
});

export default Button;