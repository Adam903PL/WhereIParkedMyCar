import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { Magnetometer } from 'expo-sensors';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Dimensions,
  Linking,
  Platform,
  Alert as RNAlert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { t } from '../i18n';
import { COLORS, SPACING, TYPOGRAPHY } from '../theme/designTokens';
import Button from './components/ui/Button';

const { width, height } = Dimensions.get('window');
const compassSize = Math.min(width * 0.7, height * 0.4, 280); // Responsive compass size

interface CompassScreenProps {
  navigation?: any;
}

export default function CompassScreen({ navigation }: CompassScreenProps) {
  const [parkedLocation, setParkedLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [distance, setDistance] = useState<number | null>(null);
  const [bearing, setBearing] = useState<number | null>(null);
  const [heading, setHeading] = useState<number>(0);
  const [isCalibrated, setIsCalibrated] = useState(false);
  const arrowRotation = useSharedValue(0);

  // Load parked location from storage
  const loadParkedLocation = useCallback(async () => {
    try {
      const saved = await AsyncStorage.getItem('parkedLocation');
      if (saved) {
        const parsedLocation = JSON.parse(saved);
        setParkedLocation(parsedLocation);
      } else {
        RNAlert.alert(
          t('common.error'),
          t('parking.noLocationMessage'),
          [{ text: t('common.ok'), onPress: () => router.back() }]
        );
      }
    } catch (error) {
      console.error('Error loading parked location:', error);
      RNAlert.alert(
        t('common.error'),
        t('parking.loadError'),
        [{ text: t('common.ok'), onPress: () => router.back() }]
      );
    }
  }, []);

  // Get current location
  const getCurrentLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        RNAlert.alert(
          t('permissions.locationDenied'),
          t('permissions.locationAccessError')
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.error('Error getting current location:', error);
    }
  }, []);

  // Magnetometer for device heading
  const setupMagnetometer = useCallback(() => {
    Magnetometer.isAvailableAsync().then((available) => {
      if (!available) {
        RNAlert.alert('Error', 'Magnetometer is not available on this device');
        return;
      }
      Magnetometer.setUpdateInterval(100); // Update every 100ms
      const subscription = Magnetometer.addListener((data) => {
        // Calculate heading from magnetometer (x, y, z)
        let heading = Math.atan2(data.y, data.x) * (180 / Math.PI);
        if (Platform.OS === 'ios') {
          heading = heading >= 0 ? heading : heading + 360;
        } else {
          heading = (heading + 360) % 360;
        }
         setHeading(heading);
         setIsCalibrated(true); // Assume calibrated after getting magnetometer data
      });
      return () => subscription.remove();
    });
  }, []);

  // Calculate distance and bearing
  const calculateDistanceAndBearing = useCallback(() => {
    if (!parkedLocation || !currentLocation) return;

    const R = 6371000; // Earth's radius in meters
    const lat1 = (currentLocation.latitude * Math.PI) / 180;
    const lat2 = (parkedLocation.latitude * Math.PI) / 180;
    const deltaLat = ((parkedLocation.latitude - currentLocation.latitude) * Math.PI) / 180;
    const deltaLon = ((parkedLocation.longitude - currentLocation.longitude) * Math.PI) / 180;

    // Haversine formula for distance
    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const calculatedDistance = R * c;
    setDistance(calculatedDistance);

    // Bearing from current to parked location
    const y = Math.sin(deltaLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLon);
    const calculatedBearing = (Math.atan2(y, x) * 180) / Math.PI;
    const normalizedBearing = (calculatedBearing + 360) % 360;
    setBearing(normalizedBearing);
  }, [parkedLocation, currentLocation]);

  // Update arrow rotation
  const updateArrowRotation = useCallback(() => {
    if (bearing === null || !isCalibrated) return;
    // Arrow points to target: bearing - heading (north-up compass)
    const adjustedRotation = bearing - heading;
    arrowRotation.value = withSpring(adjustedRotation, { damping: 15, stiffness: 100 });
  }, [bearing, heading, isCalibrated, arrowRotation]);

  // Navigate to car using Google Maps
  const navigateToCar = useCallback(async () => {
    if (!parkedLocation) {
      RNAlert.alert(
        t('parking.noLocation'),
        t('parking.noLocationMessage'),
        [{ text: t('common.ok') }]
      );
      return;
    }

    const url = `https://www.google.com/maps/dir/?api=1&destination=${parkedLocation.latitude},${parkedLocation.longitude}`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        RNAlert.alert(
          t('common.error'),
          t('parking.mapsError'),
          [{ text: t('common.ok') }]
        );
      }
    } catch (error) {
      console.error('Error opening maps:', error);
      RNAlert.alert(
        t('common.error'),
        t('parking.mapsError'),
        [{ text: t('common.ok') }]
      );
    }
  }, [parkedLocation]);

  // Initialize
  useEffect(() => {
    const initialize = async () => {
      await loadParkedLocation();
      await getCurrentLocation();
      setIsLoading(false);
    };
    initialize();
    const cleanup = setupMagnetometer();
    return cleanup;
  }, [loadParkedLocation, getCurrentLocation, setupMagnetometer]);

  // Update location periodically
  useEffect(() => {
    const locationUpdateInterval = setInterval(() => {
      if (parkedLocation) {
        getCurrentLocation();
      }
    }, 5000);
    return () => clearInterval(locationUpdateInterval);
  }, [getCurrentLocation, parkedLocation]);

  // Recalculate distance and bearing
  useEffect(() => {
    calculateDistanceAndBearing();
  }, [calculateDistanceAndBearing]);

  // Update arrow rotation
  useEffect(() => {
    updateArrowRotation();
  }, [updateArrowRotation]);

  // Format distance
  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)} ${t('compass.meters')}`;
    }
    return `${(meters / 1000).toFixed(2)} ${t('compass.kilometers')}`;
  };

  // Get direction text
  const getDirectionText = (bearing: number): string => {
    const directions = [
      { range: [0, 22.5], text: t('compass.north') },
      { range: [22.5, 67.5], text: t('compass.northeast') },
      { range: [67.5, 112.5], text: t('compass.east') },
      { range: [112.5, 157.5], text: t('compass.southeast') },
      { range: [157.5, 202.5], text: t('compass.south') },
      { range: [202.5, 247.5], text: t('compass.southwest') },
      { range: [247.5, 292.5], text: t('compass.west') },
      { range: [292.5, 337.5], text: t('compass.northwest') },
      { range: [337.5, 360], text: t('compass.north') },
    ];
    for (const direction of directions) {
      if (bearing >= direction.range[0] && bearing < direction.range[1]) {
        return direction.text;
      }
    }
    return t('compass.north');
  };

  const arrowAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${arrowRotation.value}deg` }],
  }));

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <BlurView intensity={40} style={styles.blurOverlay}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>{t('compass.calibrating')}</Text>
          </View>
        </BlurView>
      </SafeAreaView>
    );
  }

  if (!parkedLocation) {
    return (
      <SafeAreaView style={styles.container}>
        <BlurView intensity={40} style={styles.blurOverlay}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{t('parking.noLocation')}</Text>
            <Button
              title={t('compass.backToHome')}
              onPress={() => router.back()}
              variant="primary"
              size="lg"
            />
          </View>
        </BlurView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <BlurView intensity={40} style={styles.blurOverlay}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          <View style={styles.headerContainer}>
            <View style={styles.header}>
              <View style={styles.titleContainer}>
                <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit>
                  {t('compass.title')}
                </Text>
              </View>
              <View style={styles.backButtonContainer}>
                <Button
                  title={t('compass.backToHome')}
                  onPress={() => router.back()}
                  variant="ghost"
                  size="sm"
                  icon="arrow-back-outline"
                />
              </View>
            </View>
          </View>

          <View style={styles.compassContainer}>
            <View style={styles.compass}>
              <View style={styles.compassFace}>
                <View style={styles.northMarker}>
                  <Text style={styles.northText}>N</Text>
                </View>
                {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, index) => (
                  <View
                    key={index}
                    style={[styles.directionMarker, { transform: [{ rotate: `${angle}deg` }] }]}
                  />
                ))}
                <View style={styles.cardinalLabels}>
                  <Text style={[styles.cardinalLabel, styles.northLabel]}>N</Text>
                  <Text style={[styles.cardinalLabel, styles.eastLabel]}>E</Text>
                  <Text style={[styles.cardinalLabel, styles.southLabel]}>S</Text>
                  <Text style={[styles.cardinalLabel, styles.westLabel]}>W</Text>
                </View>
                  <Animated.View style={[styles.arrow, arrowAnimatedStyle]}>
                    <View style={styles.arrowBody} />
                    <View style={styles.arrowHead} />
                  </Animated.View>
                  
                  {/* Center dot */}
                  <View style={styles.centerDot} />
              </View>
            </View>
          </View>

          <View style={styles.infoContainer}>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>{t('compass.distanceToCar')}</Text>
              <Text style={styles.infoValue}>
                {distance !== null ? formatDistance(distance) : '--'}
              </Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>{t('compass.directionToCar')}</Text>
              <Text style={styles.infoValue}>
                {bearing !== null ? getDirectionText(bearing) : '--'}
              </Text>
            </View>
          </View>

          <View style={styles.accuracyContainer}>
            <Text style={styles.accuracyLabel}>{t('compass.accuracy')}</Text>
            <Text
              style={[
                styles.accuracyValue,
                { color: isCalibrated ? COLORS.success[500] : COLORS.warning[500] },
              ]}
            >
              {isCalibrated ? t('compass.excellent') : t('compass.poor')}
            </Text>
          </View>

          <View style={styles.actionButtonsContainer}>
            <Button
              title={t('parking.navigateToCar')}
              onPress={navigateToCar}
              variant="success"
              size="lg"
              icon="navigate-outline"
              style={styles.navigateButton}
              fullWidth
            />
            <Button
              title={t('compass.calibrating')}
              onPress={setupMagnetometer}
              variant="ghost"
              size="md"
              icon="refresh-outline"
              style={styles.recalibrateButton}
            />
          </View>
        </ScrollView>
      </BlurView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  blurOverlay: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingBottom: SPACING.xxxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: TYPOGRAPHY.fontSizes.lg,
    fontWeight: TYPOGRAPHY.fontWeights.medium as any,
    color: COLORS.text.primary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.xl,
    paddingHorizontal: SPACING.xl,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSizes.lg,
    fontWeight: TYPOGRAPHY.fontWeights.medium as any,
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  headerContainer: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  titleContainer: {
    flex: 1,
    marginRight: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSizes['2xl'],
    fontWeight: TYPOGRAPHY.fontWeights.bold as any,
    color: COLORS.text.primary,
  },
  backButtonContainer: {
    flexShrink: 0,
    minWidth: 120,
    alignItems: 'flex-end',
  },
  compassContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: SPACING.md,
    minHeight: compassSize + SPACING.lg,
    maxHeight: height * 0.5,
    paddingHorizontal: SPACING.xl,
  },
  compass: {
    width: compassSize,
    height: compassSize,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compassFace: {
    width: '100%',
    height: '100%',
    borderRadius: compassSize / 2,
    borderWidth: 3,
    borderColor: COLORS.neutral[600],
    backgroundColor: COLORS.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: COLORS.neutral[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  northMarker: {
    position: 'absolute',
    top: 8,
    width: 28,
    height: 28,
    backgroundColor: COLORS.error[500],
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.error[500],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  northText: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.fontSizes.xs,
    fontWeight: TYPOGRAPHY.fontWeights.bold as any,
  },
  directionMarker: {
    position: 'absolute',
    top: 4,
    width: 1.5,
    height: Math.max(compassSize * 0.08, 12),
    backgroundColor: COLORS.text.secondary,
  },
  cardinalLabels: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  cardinalLabel: {
    position: 'absolute',
    fontSize: TYPOGRAPHY.fontSizes.sm,
    fontWeight: TYPOGRAPHY.fontWeights.bold as any,
    color: COLORS.text.primary,
    backgroundColor: COLORS.background.secondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  northLabel: { top: 4, left: '50%', transform: [{ translateX: -8 }] },
  eastLabel: { right: 4, top: '50%', transform: [{ translateY: -8 }] },
  southLabel: { bottom: 4, left: '50%', transform: [{ translateX: -8 }] },
  westLabel: { left: 4, top: '50%', transform: [{ translateY: -8 }] },
  centerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.neutral[400],
    position: 'absolute',
    shadowColor: COLORS.neutral[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  arrow: {
    position: 'absolute',
    width: compassSize * 0.4,
    height: compassSize * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowBody: {
    width: 4,
    height: '60%',
    backgroundColor: COLORS.success[500],
    borderRadius: 2,
    shadowColor: COLORS.success[500],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  arrowHead: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 16,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: COLORS.success[500],
    marginTop: -2,
  },
  infoContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  infoCard: {
    flex: 1,
    backgroundColor: COLORS.background.secondary,
    padding: SPACING.lg,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: COLORS.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoLabel: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    fontWeight: TYPOGRAPHY.fontWeights.medium as any,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  infoValue: {
    fontSize: TYPOGRAPHY.fontSizes.lg,
    fontWeight: TYPOGRAPHY.fontWeights.bold as any,
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  accuracyContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  accuracyLabel: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    fontWeight: TYPOGRAPHY.fontWeights.medium as any,
    color: COLORS.text.secondary,
  },
  accuracyValue: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    fontWeight: TYPOGRAPHY.fontWeights.medium as any,
  },
  actionButtonsContainer: {
    paddingHorizontal: SPACING.xl,
    gap: SPACING.md,
  },
  navigateButton: {
    marginBottom: SPACING.sm,
  },
  recalibrateButton: {
    alignSelf: 'center',
  },
});