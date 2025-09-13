// components/ui/Alert.tsx
import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import {
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

type AlertVariant = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  visible: boolean;
  title: string;
  message: string;
  variant?: AlertVariant;
  onClose: () => void;
  customActions?: {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'ghost';
  }[];
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
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);

  React.useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 200 });
      scale.value = withSpring(1, {
        damping: 20,
        stiffness: 300,
      });
      translateY.value = withSpring(0, {
        damping: 20,
        stiffness: 300,
      });
    } else {
      opacity.value = withTiming(0, { duration: 150 });
      scale.value = withTiming(0.9, { duration: 150 });
      translateY.value = withTiming(20, { duration: 150 });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!visible) return null;

  const getVariantConfig = () => {
    switch (variant) {
      case 'success':
        return {
          icon: 'checkmark-circle',
          iconColor: '#10B981',
          backgroundColor: '#F0FDF4',
          borderColor: '#BBF7D0',
        };
      case 'error':
        return {
          icon: 'close-circle',
          iconColor: '#EF4444',
          backgroundColor: '#FEF2F2',
          borderColor: '#FECACA',
        };
      case 'warning':
        return {
          icon: 'warning',
          iconColor: '#F59E0B',
          backgroundColor: '#FFFBEB',
          borderColor: '#FDE68A',
        };
      case 'info':
      default:
        return {
          icon: 'information-circle',
          iconColor: '#3B82F6',
          backgroundColor: '#EFF6FF',
          borderColor: '#BFDBFE',
        };
    }
  };

  const config = getVariantConfig();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.backdrop, backdropStyle]} />
        <TouchableOpacity
          style={styles.backdropTouchable}
          activeOpacity={1}
          onPress={onClose}
        />
        
        <Animated.View style={[animatedStyle]}>
          <View style={[
            styles.alert,
            {
              backgroundColor: config.backgroundColor,
              borderColor: config.borderColor,
            },
            style
          ]}>
            {/* Header with icon and close button */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name={config.icon as keyof typeof Ionicons.glyphMap}
                  size={24}
                  color={config.iconColor}
                />
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.content}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>
            </View>

            {/* Actions */}
            {(customActions || []).length > 0 ? (
              <View style={styles.actions}>
                {customActions?.map((action, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.actionButton,
                      action.variant === 'ghost' 
                        ? styles.ghostButton 
                        : [styles.primaryButton, { backgroundColor: config.iconColor }]
                    ]}
                    onPress={action.onPress}
                  >
                    <Text
                      style={[
                        styles.actionButtonText,
                        action.variant === 'ghost' 
                          ? [styles.ghostButtonText, { color: config.iconColor }]
                          : styles.primaryButtonText
                      ]}
                    >
                      {action.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}
          </View>
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
    paddingHorizontal: 20,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdropTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  alert: {
    width: Math.min(width - 40, 400),
    borderRadius: 16,
    borderWidth: 1,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    lineHeight: 24,
  },
  message: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
    flexWrap: 'wrap',
  },
  actionButton: {
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    minWidth: 100,
  },
  primaryButton: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  ghostButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: 'rgba(107, 114, 128, 0.2)',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: '#FFFFFF',
  },
  ghostButtonText: {
    // color will be set dynamically based on variant
  },
});

export default Alert;