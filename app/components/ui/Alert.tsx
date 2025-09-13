// components/ui/Alert.tsx
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { t } from '../../../i18n';
import {
  ALERT_VARIANTS,
  ANIMATIONS,
  BORDER_RADIUS,
  COLORS,
  SHADOWS,
  SPACING,
  TYPOGRAPHY,
} from '../../../theme/designTokens';

type AlertVariant = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  visible: boolean;
  title: string;
  message: string;
  variant?: AlertVariant;
  onClose: () => void;
  customActions?: Array<{
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'ghost';
  }>;
  style?: ViewStyle;
}

const Alert: React.FC<AlertProps> = ({
  visible,
  title,
  message,
  variant = 'info',
  onClose,
  customActions,
  style,
}) => {
  const alertScale = useSharedValue(0);
  const alertOpacity = useSharedValue(0);
  const backdropOpacity = useSharedValue(0);

  React.useEffect(() => {
    if (visible) {
      backdropOpacity.value = withTiming(1, {
        duration: ANIMATIONS.timing.normal,
        easing: Easing.out(Easing.quad),
      });
      alertScale.value = withSpring(1, ANIMATIONS.spring.bouncy);
      alertOpacity.value = withTiming(1, {
        duration: ANIMATIONS.timing.normal,
        easing: Easing.out(Easing.quad),
      });
    } else {
      backdropOpacity.value = withTiming(0, {
        duration: ANIMATIONS.timing.fast,
      });
      alertScale.value = withSpring(0, ANIMATIONS.spring.gentle);
      alertOpacity.value = withTiming(0, {
        duration: ANIMATIONS.timing.fast,
      });
    }
  }, [visible]);

  const alertAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: alertScale.value }],
    opacity: alertOpacity.value,
  }));

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  if (!visible) return null;

  const variantConfig = ALERT_VARIANTS[variant];

  return (
    <Modal transparent visible={visible} animationType="none" statusBarTranslucent>
      <View style={styles.overlay}>
        <Animated.View style={[styles.backdrop, backdropAnimatedStyle]} />
        <TouchableOpacity
          style={styles.backdropTouchable}
          activeOpacity={1}
          onPress={onClose}
        />
        
        <Animated.View style={[styles.alert, alertAnimatedStyle, style]}>
          <LinearGradient
            colors={variantConfig.colors as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.alertGradient}
          >
            <View style={styles.content}>
              {/* Icon */}
              <View style={styles.iconContainer}>
                <Ionicons
                  name={variantConfig.icon as keyof typeof Ionicons.glyphMap}
                  size={48}
                  color={COLORS.text.primary}
                />
              </View>

              {/* Title */}
              <Text style={styles.title}>{title}</Text>

              {/* Message */}
              <Text style={styles.message}>{message}</Text>

              {/* Actions */}
              <View style={styles.actions}>
                {customActions ? (
                  customActions.map((action, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.actionButton,
                        action.variant === 'ghost' && styles.ghostButton,
                      ]}
                      onPress={action.onPress}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.actionButtonText,
                          action.variant === 'ghost' && styles.ghostButtonText,
                        ]}
                      >
                        {action.title}
                      </Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={onClose}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.actionButtonText}>
                      {t('common.ok')}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.background.overlay,
  },
  backdropTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  alert: {
    borderRadius: BORDER_RADIUS.xxl,
    overflow: 'hidden',
    ...SHADOWS.xl,
    maxWidth: 400,
    width: '100%',
  },
  alertGradient: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xxxl,
  },
  content: {
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.fontSizes['2xl'],
    fontWeight: TYPOGRAPHY.fontWeights.extrabold as any,
    marginBottom: SPACING.sm,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  } as TextStyle,
  message: {
    color: COLORS.text.secondary,
    fontSize: TYPOGRAPHY.fontSizes.base,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.fontSizes.base * TYPOGRAPHY.lineHeights.normal,
    marginBottom: SPACING.xl,
    fontWeight: TYPOGRAPHY.fontWeights.medium as any,
  } as TextStyle,
  actions: {
    flexDirection: 'row',
    gap: SPACING.md,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    minWidth: 100,
    ...SHADOWS.small,
  },
  ghostButton: {
    backgroundColor: 'transparent',
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  actionButtonText: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.fontSizes.base,
    fontWeight: TYPOGRAPHY.fontWeights.bold as any,
    textAlign: 'center',
  } as TextStyle,
  ghostButtonText: {
    opacity: 0.9,
  },
});

export default Alert;