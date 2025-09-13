import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { t } from '../../i18n';

// Custom Alert Component
interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

const CustomAlert: React.FC<CustomAlertProps> = ({ visible, title, message, type, onClose }) => {
  const alertScale = useSharedValue(0);
  const alertOpacity = useSharedValue(0);

  const getGradientColors = () => {
    switch (type) {
      case 'success':
        return ['#4CAF50', '#66BB6A'];
      case 'error':
        return ['#F44336', '#EF5350'];
      case 'info':
        return ['#2196F3', '#42A5F5'];
      default:
        return ['#2196F3', '#42A5F5'];
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'checkmark-circle';
      case 'error':
        return 'close-circle';
      case 'info':
        return 'information-circle';
      default:
        return 'information-circle';
    }
  };

  React.useEffect(() => {
    if (visible) {
      alertScale.value = withSpring(1, {
        damping: 15,
        stiffness: 150,
      });
      alertOpacity.value = withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.quad),
      });
    } else {
      alertScale.value = withSpring(0);
      alertOpacity.value = withTiming(0, {
        duration: 200,
      });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: alertScale.value }],
    opacity: alertOpacity.value,
  }));

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.alertOverlay}>
        <TouchableOpacity 
          style={styles.alertBackdrop} 
          activeOpacity={1} 
          onPress={onClose}
        />
        <Animated.View style={[styles.customAlert, animatedStyle]}>
          <LinearGradient
            colors={getGradientColors() as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.alertGradient}
          >
            <View style={styles.alertContent}>
              <Ionicons name={getIcon() as any} size={48} color="#FFF" />
              <Text style={styles.alertTitle}>{title}</Text>
              <Text style={styles.alertMessage}>{message}</Text>
              <TouchableOpacity 
                style={styles.alertButton}
                onPress={onClose}
                activeOpacity={0.8}
              >
                <Text style={styles.alertButtonText}>{t('common.ok')}</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // Custom Alert Styles
  alertOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  alertBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  customAlert: {
    marginHorizontal: 30,
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  alertGradient: {
    paddingHorizontal: 30,
    paddingVertical: 35,
    alignItems: 'center',
  },
  alertContent: {
    alignItems: 'center',
  },
  alertTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '800',
    marginTop: 15,
    marginBottom: 10,
    textAlign: 'center',
  },
  alertMessage: {
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 25,
    opacity: 0.9,
  },
  alertButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  alertButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default CustomAlert;
