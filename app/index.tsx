// app/index.tsx (Enhanced HomeScreen)
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import * as Location from 'expo-location';
import LottieView from 'lottie-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Dimensions,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { getCurrentLanguage, onLanguageChange, SupportedLanguage, t } from '../i18n';
import {
  ANIMATIONS,
  BORDER_RADIUS,
  COLORS,
  SHADOWS,
  SPACING,
  TYPOGRAPHY,
} from '../theme/designTokens';
import LanguageSelector from './components/LanguageSelector';
import Alert from './components/ui/Alert';
import Button from './components/ui/Button';
import StatusIndicator from './components/ui/StatusIndicator';

const { width, height } = Dimensions.get('window');

// Language flag mapping
const languageFlags: Record<SupportedLanguage, string> = {
  pl: '🇵🇱',
  en: '🇺🇸',
  uk: '🇺🇦',
  es: '🇪🇸',
};

export default function HomeScreen() {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isParking, setIsParking] = useState<boolean>(false);
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('pl');
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Alert State
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    variant: 'info' as 'success' | 'error' | 'info' | 'warning',
    customActions: undefined as {
      title: string;
      onPress: () => void;
      variant?: 'primary' | 'ghost';
    }[] | undefined,
  });

  // Animation values
  const headerOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const statusOpacity = useSharedValue(0);
  const buttonsOpacity = useSharedValue(0);
  const languageButtonScale = useSharedValue(1);

  // Initialize animations
  useEffect(() => {
    const animateIn = () => {
      headerOpacity.value = withTiming(1, { duration: 600 });
      contentOpacity.value = withDelay(200, withTiming(1, { duration: 600 }));
      statusOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
      buttonsOpacity.value = withDelay(600, withTiming(1, { duration: 600 }));
    };
    
    setTimeout(animateIn, 100);
  }, [headerOpacity, contentOpacity, statusOpacity, buttonsOpacity]);

  // Language change listener and initialization
  useEffect(() => {
    setCurrentLanguage(getCurrentLanguage());
    
    const unsubscribe = onLanguageChange((language) => {
      setCurrentLanguage(language);
    });
    return unsubscribe;
  }, []);

  // Custom Alert Function
  const showAlert = (
    title: string,
    message: string,
    variant: 'success' | 'error' | 'info' | 'warning' = 'info',
    customActions?: {
      title: string;
      onPress: () => void;
      variant?: 'primary' | 'ghost';
    }[]
  ) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      variant,
      customActions,
    });
  };

  const hideAlert = () => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  };

  const loadSavedLocation = useCallback(async () => {
    try {
      setIsLoading(true);
      const saved = await AsyncStorage.getItem('parkedLocation');
      if (saved) {
        const parsedLocation = JSON.parse(saved);
        setLocation(parsedLocation);
        setIsParking(true);
      } else {
        setLocation(null);
        setIsParking(false);
      }
    } catch (error) {
      console.error('Error loading location:', error);
      showAlert(t('common.error'), t('parking.loadError'), 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setHasPermission(false);
        showAlert(
          t('permissions.locationDenied'),
          t('permissions.locationDeniedMessage'),
          'error',
          [
            {
              title: t('common.ok'),
              onPress: hideAlert,
              variant: 'primary',
            },
          ]
        );
        return;
      }
      setHasPermission(true);
      loadSavedLocation();
    })();
  }, [loadSavedLocation]);

  const startParking = async () => {
    if (!hasPermission) return;

    setIsLoading(true);
    
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      showAlert(
        t('permissions.locationDenied'),
        t('permissions.locationAccessError'),
        'error'
      );
      setIsLoading(false);
      return;
    }

    try {
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const { latitude, longitude } = currentLocation.coords;

      await AsyncStorage.setItem('parkedLocation', JSON.stringify({ latitude, longitude }));
      setLocation({ latitude, longitude });
      setIsParking(true);
      
      showAlert(
        t('common.success'),
        t('parking.startSuccess'),
        'success',
        [
          {
            title: t('parking.navigateToCar'),
            onPress: () => {
              hideAlert();
              navigateToLocation();
            },
            variant: 'primary',
          },
          {
            title: t('common.ok'),
            onPress: hideAlert,
            variant: 'ghost',
          },
        ]
      );
    } catch (err) {
      console.error('Error saving location:', err);
      showAlert(t('common.error'), t('parking.saveError'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const endParking = async () => {
    showAlert(
      t('parking.confirmEnd'),
      t('parking.confirmEndMessage'),
      'warning',
      [
        {
          title: t('parking.endParking'),
          onPress: async () => {
            hideAlert();
            setIsLoading(true);
            try {
              await AsyncStorage.removeItem('parkedLocation');
              setLocation(null);
              setIsParking(false);
              showAlert(t('common.success'), t('parking.endSuccess'), 'success');
            } catch (error) {
              console.error('Error clearing location:', error);
              showAlert(t('common.error'), t('parking.clearError'), 'error');
            } finally {
              setIsLoading(false);
            }
          },
          variant: 'primary',
        },
        {
          title: t('common.cancel'),
          onPress: hideAlert,
          variant: 'ghost',
        },
      ]
    );
  };

  const navigateToLocation = async () => {
    if (!location) {
      showAlert(t('parking.noLocation'), t('parking.noLocationMessage'), 'info');
      return;
    }

    const url = `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        showAlert(t('common.error'), t('parking.mapsError'), 'error');
      }
    } catch {
      showAlert(t('common.error'), t('parking.mapsError'), 'error');
    }
  };

  // Animation styles
  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [
      {
        translateY: headerOpacity.value === 1 ? 0 : -20,
      },
    ],
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [
      {
        translateY: contentOpacity.value === 1 ? 0 : 30,
      },
    ],
  }));

  const statusAnimatedStyle = useAnimatedStyle(() => ({
    opacity: statusOpacity.value,
    transform: [
      {
        scale: statusOpacity.value,
      },
    ],
  }));

  const buttonsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonsOpacity.value,
    transform: [
      {
        translateY: buttonsOpacity.value === 1 ? 0 : 40,
      },
    ],
  }));

  const languageButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: languageButtonScale.value }],
  }));

  const handleLanguageButtonPress = () => {
    languageButtonScale.value = withSpring(0.95, ANIMATIONS.spring.bouncy);
    setTimeout(() => {
      languageButtonScale.value = withSpring(1, ANIMATIONS.spring.bouncy);
      setShowLanguageSelector(true);
    }, 150);
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <StatusIndicator
            variant="loading"
            title={t('permissions.requestingPermission')}
            animated
          />
        </View>
      </SafeAreaView>
    );
  }

  if (!hasPermission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <StatusIndicator
            variant="error"
            title={t('permissions.locationDenied')}
            subtitle={t('permissions.locationDeniedMessage')}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Background Lottie Animation */}
      <LottieView
        source={require('../assets/animations/Globe.json')}
        style={styles.lottieBackground}
        autoPlay
        loop
        speed={0.8}
      />
      
      {/* Blur overlay */}
      <BlurView intensity={40} style={styles.blurOverlay}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Language Selector Button */}
          <Animated.View style={[styles.languageButtonContainer, languageButtonAnimatedStyle]}>
            <TouchableOpacity
              onPress={handleLanguageButtonPress}
              activeOpacity={0.8}
              style={styles.languageButton}
              testID="language-selector-button"
            >
              <Text style={styles.languageFlag}>
                {languageFlags[currentLanguage]}
              </Text>
              <View style={styles.languageTextContainer}>
                <Text style={styles.languageButtonText}>
                  {currentLanguage.toUpperCase()}
                </Text>
                <Ionicons name="chevron-down" size={16} color={COLORS.text.secondary} />
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* Header */}
          <Animated.View style={[styles.header, headerAnimatedStyle]}>
            <Text style={styles.title}>
              🚗 {isParking ? t('parking.parkingHere') : t('parking.title')}
            </Text>
            <Text style={styles.subtitle}>
              {isParking 
                ? t('parking.parkingActiveSubtitle')
                : t('parking.welcomeSubtitle')
              }
            </Text>
          </Animated.View>
          
          {/* Status indicator */}
          <Animated.View style={[styles.statusContainer, statusAnimatedStyle]}>
            {isLoading ? (
              <StatusIndicator
                variant="loading"
                title={t('common.loading')}
                subtitle={t('common.pleaseWait')}
                animated
              />
            ) : isParking && location ? (
              <StatusIndicator
                variant="active"
                title={t('parking.parkingActive')}
                subtitle={t('parking.parkingActiveDescription')}
                icon="car-outline"
                animated
              />
            ) : (
              <StatusIndicator
                variant="inactive"
                title={t('parking.noParkingActive')}
                subtitle={t('parking.readyToStart')}
                icon="location-outline"
              />
            )}
          </Animated.View>
          
          {/* Action Buttons */}
          <Animated.View style={[styles.buttonsContainer, buttonsAnimatedStyle]}>
            {!isParking ? (
              <Button
                title={t('parking.startParking')}
                onPress={startParking}
                variant="primary"
                size="xl"
                icon="play-circle-outline"
                disabled={isLoading}
                loading={isLoading}
                fullWidth
              />
            ) : (
              <View style={styles.parkingButtons}>
                <Button
                  title={t('parking.navigateToCar')}
                  onPress={navigateToLocation}
                  variant="success"
                  size="lg"
                  icon="navigate-outline"
                  disabled={isLoading}
                  style={styles.navigationButton}
                  fullWidth
                />
                
                <Button
                  title={t('parking.endParking')}
                  onPress={endParking}
                  variant="error"
                  size="md"
                  icon="stop-circle-outline"
                  disabled={isLoading}
                  style={styles.endButton}
                  fullWidth
                />
              </View>
            )}
          </Animated.View>
          
          {/* Additional Info */}
          <Animated.View style={[styles.infoContainer, contentAnimatedStyle]}>
            <Text style={styles.infoText}>
              {isParking 
                ? t('parking.parkingInfoActive')
                : t('parking.parkingInfoInactive')
              }
            </Text>
          </Animated.View>
        </ScrollView>
      </BlurView>

      {/* Alert */}
      <Alert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        variant={alertConfig.variant}
        onClose={hideAlert}
        customActions={alertConfig.customActions}
      />

      {/* Language Selector */}
      <LanguageSelector
        visible={showLanguageSelector}
        onClose={() => setShowLanguageSelector(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  lottieBackground: {
    position: 'absolute',
    width: width * 1.5,
    height: height * 1.5,
    top: -(height * 0.25),
    left: -(width * 0.25),
    opacity: 0.6,
  },
  blurOverlay: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxxl,
  },
  languageButtonContainer: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.lg,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.blur,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.xxl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    ...SHADOWS.medium,
    minHeight: 48,
  },
  languageFlag: {
    fontSize: 24,
    marginRight: SPACING.sm,
  },
  languageTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageButtonText: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.fontSizes.sm,
    fontWeight: TYPOGRAPHY.fontWeights.bold as any,
    marginRight: SPACING.xs,
  } as TextStyle,
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSizes['4xl'],
    fontWeight: TYPOGRAPHY.fontWeights.extrabold as any,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  } as TextStyle,
  subtitle: {
    fontSize: TYPOGRAPHY.fontSizes.lg,
    fontWeight: TYPOGRAPHY.fontWeights.medium as any,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.fontSizes.lg * TYPOGRAPHY.lineHeights.normal,
  } as TextStyle,
  statusContainer: {
    marginBottom: SPACING.xl,
  },
  buttonsContainer: {
    marginBottom: SPACING.xl,
  },
  parkingButtons: {
    gap: SPACING.lg,
  },
  navigationButton: {
    marginBottom: SPACING.md,
  },
  endButton: {
    opacity: 0.9,
  },
  infoContainer: {
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  infoText: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    fontWeight: TYPOGRAPHY.fontWeights.medium as any,
    color: COLORS.text.tertiary,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.fontSizes.sm * TYPOGRAPHY.lineHeights.relaxed,
  } as TextStyle,
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
});