// components/ui/StatusIndicator.tsx
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import {
    BORDER_RADIUS,
    COLORS,
    SHADOWS,
    SPACING,
    TYPOGRAPHY,
} from '../../../theme/designTokens';

type StatusVariant = 'active' | 'inactive' | 'loading' | 'error' | 'warning';

interface StatusIndicatorProps {
  variant: StatusVariant;
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  animated?: boolean;
  style?: ViewStyle;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  variant,
  title,
  subtitle,
  icon,
  animated = true,
  style,
}) => {
  const scale = useSharedValue(1);
  const pulseOpacity = useSharedValue(1);

  React.useEffect(() => {
    if (animated && (variant === 'active' || variant === 'loading')) {
      // Subtle pulsing animation
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.7, { duration: 1500 }),
          withTiming(1, { duration: 1500 })
        ),
        -1,
        true
      );
      
      // Gentle scale animation on mount
      scale.value = withSequence(
        withTiming(1.05, { duration: 300 }),
        withTiming(1, { duration: 300 })
      );
    }
  }, [variant, animated]);

  const getVariantConfig = () => {
    switch (variant) {
      case 'active':
        return {
          backgroundColor: `${COLORS.success[500]}25`,
          borderColor: `${COLORS.success[500]}40`,
          iconColor: COLORS.success[400],
          textColor: COLORS.text.primary,
          subtitleColor: COLORS.text.secondary,
          gradientColors: [
            `${COLORS.success[500]}20`,
            `${COLORS.success[600]}15`,
          ],
          defaultIcon: 'checkmark-circle' as keyof typeof Ionicons.glyphMap,
        };
      case 'inactive':
        return {
          backgroundColor: `${COLORS.neutral[600]}25`,
          borderColor: `${COLORS.neutral[600]}40`,
          iconColor: COLORS.neutral[400],
          textColor: COLORS.text.secondary,
          subtitleColor: COLORS.text.tertiary,
          gradientColors: [
            `${COLORS.neutral[600]}20`,
            `${COLORS.neutral[700]}15`,
          ],
          defaultIcon: 'ellipse-outline' as keyof typeof Ionicons.glyphMap,
        };
      case 'loading':
        return {
          backgroundColor: `${COLORS.primary[500]}25`,
          borderColor: `${COLORS.primary[500]}40`,
          iconColor: COLORS.primary[400],
          textColor: COLORS.text.primary,
          subtitleColor: COLORS.text.secondary,
          gradientColors: [
            `${COLORS.primary[500]}20`,
            `${COLORS.primary[600]}15`,
          ],
          defaultIcon: 'time-outline' as keyof typeof Ionicons.glyphMap,
        };
      case 'error':
        return {
          backgroundColor: `${COLORS.error[500]}25`,
          borderColor: `${COLORS.error[500]}40`,
          iconColor: COLORS.error[400],
          textColor: COLORS.text.primary,
          subtitleColor: COLORS.text.secondary,
          gradientColors: [
            `${COLORS.error[500]}20`,
            `${COLORS.error[600]}15`,
          ],
          defaultIcon: 'close-circle' as keyof typeof Ionicons.glyphMap,
        };
      case 'warning':
        return {
          backgroundColor: `${COLORS.warning[500]}25`,
          borderColor: `${COLORS.warning[500]}40`,
          iconColor: COLORS.warning[400],
          textColor: COLORS.text.primary,
          subtitleColor: COLORS.text.secondary,
          gradientColors: [
            `${COLORS.warning[500]}20`,
            `${COLORS.warning[600]}15`,
          ],
          defaultIcon: 'warning' as keyof typeof Ionicons.glyphMap,
        };
    }
  };

  const config = getVariantConfig();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle, style]}>
      <LinearGradient
        colors={config.gradientColors as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.gradient,
          {
            borderColor: config.borderColor,
          },
        ]}
      >
        <View style={styles.content}>
          {/* Icon with pulse effect */}
          <Animated.View
            style={[
              styles.iconContainer,
              animated && (variant === 'active' || variant === 'loading')
                ? pulseAnimatedStyle
                : {},
            ]}
          >
            <Ionicons
              name={icon || config.defaultIcon}
              size={24}
              color={config.iconColor}
            />
          </Animated.View>

          {/* Text content */}
          <View style={styles.textContainer}>
            <Text
              style={[
                styles.title,
                { color: config.textColor },
              ]}
            >
              {title}
            </Text>
            {subtitle && (
              <Text
                style={[
                  styles.subtitle,
                  {
                    color: config.subtitleColor,
                  },
                ]}
              >
                {subtitle}
              </Text>
            )}
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  gradient: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.lg,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  iconContainer: {
    marginRight: SPACING.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: TYPOGRAPHY.fontSizes.base,
    fontWeight: '600',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    opacity: 0.8,
  },
});

export default StatusIndicator;