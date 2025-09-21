// app/index.tsx (Enhanced HomeScreen)
import AsyncStorage from "@react-native-async-storage/async-storage";

import { BlurView } from "expo-blur";
import * as Location from "expo-location";
import { router } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Linking,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextStyle,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { onLanguageChange, t } from "../i18n";
import { COLORS, SPACING, TYPOGRAPHY } from "../theme/designTokens";

import MobileAds, {
  AdEventType,
  AppOpenAd,
  BannerAd,
  BannerAdSize,
  useForeground
} from "react-native-google-mobile-ads";

import { ENV } from "../config/env";
import LanguageSelector from "./components/LanguageSelector";
import Alert from "./components/ui/Alert";
import Button from "./components/ui/Button";
import ParkingTimer from "./components/ui/ParkingTimer";
import StatusIndicator from "./components/ui/StatusIndicator";

const { width, height } = Dimensions.get("window");


// pierwsze id testowe
const adUnitId = __DEV__ ? 'ca-app-pub-3940256099942544/9257395921' : ENV.ADMOB_APP_OPEN_ID
const bannerAdUnitId = __DEV__ ? 'ca-app-pub-3940256099942544/9214589741' : ENV.ADMOB_BANNER_ID

// const adUnitId = 'ca-app-pub-4881517997860906/1415723980'
// const bannerAdUnitId = 'ca-app-pub-4881517997860906/5192167523'

export default function HomeScreen() {
  // const adUnitId = __DEV__ ? TestIds.APP_OPEN : 'ca-app-pub-xxxxxxxxxxxxx/yyyyyyyyyyyyyy';
  const bannerRef = useRef<BannerAd>(null);
  const insets = useSafeAreaInsets();
  useForeground(() => {
    Platform.OS === "ios" && bannerRef.current?.load();
  });
  MobileAds().initialize().then((adapterStatuses: any) => {
    console.log('AdMob initialized', adapterStatuses);
  });
  useEffect(() => {
    console.log('🚀 Initializing App Open Ad with ID:', adUnitId);
    
    const appOpenAd = AppOpenAd.createForAdRequest(adUnitId, {
      keywords: ["parking", "car"],
    });

    const unsubscribeLoaded = appOpenAd.addAdEventListener(
      AdEventType.LOADED,
      () => {
        console.log('✅ App Open Ad loaded successfully');
        appOpenAd.show();
      }
    );

    const unsubscribeError = appOpenAd.addAdEventListener(
      AdEventType.ERROR,
      (err) => {
        console.error('❌ App Open Ad error:', err);
      }
    );

    const unsubscribeOpened = appOpenAd.addAdEventListener(
      AdEventType.OPENED,
      () => {
        console.log('🎯 App Open Ad opened');
      }
    );

    const unsubscribeClosed = appOpenAd.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        console.log('📱 App Open Ad closed');
      }
    );

    console.log('🔄 Loading App Open Ad...');
    appOpenAd.load();

    return () => {
      unsubscribeLoaded();
      unsubscribeError();
      unsubscribeOpened();
      unsubscribeClosed();
    };
  }, []);

  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isParking, setIsParking] = useState<boolean>(false);
  const [parkingStartTime, setParkingStartTime] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [languageKey, setLanguageKey] = useState(0); // Force re-render on language change

  // Alert State
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: "",
    message: "",
    variant: "info" as "success" | "error" | "info" | "warning",
    customActions: undefined as
      | {
          title: string;
          onPress: () => void;
          variant?: "primary" | "ghost";
        }[]
      | undefined,
  });

  // Animation values
  const headerOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const statusOpacity = useSharedValue(0);
  const buttonsOpacity = useSharedValue(0);

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

  // Listen for language changes
  useEffect(() => {
    const unsubscribe = onLanguageChange(() => {
      setLanguageKey((prev) => prev + 1); // Force re-render
    });
    return unsubscribe;
  }, []);

  // Custom Alert Function
  const showAlert = (
    title: string,
    message: string,
    variant: "success" | "error" | "info" | "warning" = "info",
    customActions?: {
      title: string;
      onPress: () => void;
      variant?: "primary" | "ghost";
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
    setAlertConfig((prev) => ({ ...prev, visible: false }));
  };

  const loadSavedLocation = useCallback(async () => {
    try {
      setIsLoading(true);
      const saved = await AsyncStorage.getItem("parkedLocation");
      const savedStartTime = await AsyncStorage.getItem("parkingStartTime");

      console.log("Loading saved location:", saved);
      console.log("Loading saved start time:", savedStartTime);

      if (saved) {
        const parsedLocation = JSON.parse(saved);
        console.log("Parsed location:", parsedLocation);

        setLocation(parsedLocation);
        setIsParking(true);

        // Load parking start time
        if (savedStartTime) {
          setParkingStartTime(parseInt(savedStartTime, 10));
        } else {
          // If no start time saved, use current time (fallback for existing users)
          const fallbackTime = Date.now();
          setParkingStartTime(fallbackTime);
          await AsyncStorage.setItem(
            "parkingStartTime",
            fallbackTime.toString()
          );
        }

        console.log("Successfully loaded parking session");
      } else {
        console.log("No saved location found");
        setLocation(null);
        setIsParking(false);
        setParkingStartTime(null);
      }
    } catch (error) {
      console.error("Error loading location:", error);
      showAlert(t("common.error"), t("parking.loadError"), "error");
      // Reset state on error
      setLocation(null);
      setIsParking(false);
      setParkingStartTime(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setHasPermission(false);
        showAlert(
          t("permissions.locationDenied"),
          t("permissions.locationDeniedMessage"),
          "error",
          [
            {
              title: t("common.ok"),
              onPress: hideAlert,
              variant: "primary",
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
    if (status !== "granted") {
      showAlert(
        t("permissions.locationDenied"),
        t("permissions.locationAccessError"),
        "error"
      );
      setIsLoading(false);
      return;
    }

    try {
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const { latitude, longitude } = currentLocation.coords;
      const startTime = Date.now();

      const locationData = { latitude, longitude };

      // Save to AsyncStorage with error handling
      await AsyncStorage.setItem(
        "parkedLocation",
        JSON.stringify(locationData)
      );
      await AsyncStorage.setItem("parkingStartTime", startTime.toString());

      // Verify the data was saved correctly
      const savedLocation = await AsyncStorage.getItem("parkedLocation");
      const savedStartTime = await AsyncStorage.getItem("parkingStartTime");

      if (!savedLocation || !savedStartTime) {
        throw new Error("Failed to save parking data to storage");
      }

      console.log("Parking location saved successfully:", locationData);

      setLocation(locationData);
      setParkingStartTime(startTime);
      setIsParking(true);

      showAlert(t("common.success"), t("parking.startSuccess"), "success", [
        {
          title: t("parking.navigateToCar"),
          onPress: () => {
            hideAlert();
            navigateToLocation();
          },
          variant: "primary",
        },
        {
          title: t("common.ok"),
          onPress: hideAlert,
          variant: "ghost",
        },
      ]);
    } catch (err) {
      console.error("Error saving location:", err);
      showAlert(t("common.error"), t("parking.saveError"), "error");
    } finally {
      setIsLoading(false);
    }
  };

  const endParking = async () => {
    showAlert(
      t("parking.confirmEnd"),
      t("parking.confirmEndMessage"),
      "warning",
      [
        {
          title: t("parking.endParking"),
          onPress: async () => {
            hideAlert();
            setIsLoading(true);
            try {
              await AsyncStorage.removeItem("parkedLocation");
              await AsyncStorage.removeItem("parkingStartTime");
              setLocation(null);
              setParkingStartTime(null);
              setIsParking(false);
              showAlert(
                t("common.success"),
                t("parking.endSuccess"),
                "success"
              );
            } catch (error) {
              console.error("Error clearing location:", error);
              showAlert(t("common.error"), t("parking.clearError"), "error");
            } finally {
              setIsLoading(false);
            }
          },
          variant: "primary",
        },
        {
          title: t("common.cancel"),
          onPress: hideAlert,
          variant: "ghost",
        },
      ]
    );
  };

  const navigateToLocation = async () => {
    let currentLocation = location;

    if (!currentLocation) {
      try {
        const saved = await AsyncStorage.getItem("parkedLocation");
        if (saved) {
          currentLocation = JSON.parse(saved);
        }
      } catch (error) {
        console.error("Error loading location from storage:", error);
      }
    }

    if (!currentLocation) {
      showAlert(
        t("parking.noLocation"),
        t("parking.noLocationMessage"),
        "info"
      );
      return;
    }

    const url = `https://www.google.com/maps/dir/?api=1&destination=${currentLocation.latitude},${currentLocation.longitude}`;

    try {
      // zamiast sprawdzać canOpenURL, od razu próbujemy otworzyć
      await Linking.openURL(url);
    } catch (err) {
      console.error("Błąd otwierania Maps:", err);
      // fallback - w razie czego spróbuj otworzyć geo:
      const fallback = `geo:${currentLocation.latitude},${currentLocation.longitude}?q=${currentLocation.latitude},${currentLocation.longitude}`;
      try {
        await Linking.openURL(fallback);
      } catch {
        showAlert(t("common.error"), t("parking.mapsError"), "error");
      }
    }
  };

  const openCompass = async () => {
    // Check both state and AsyncStorage to ensure we have the location
    let currentLocation = location;

    if (!currentLocation) {
      try {
        const saved = await AsyncStorage.getItem("parkedLocation");
        if (saved) {
          currentLocation = JSON.parse(saved);
        }
      } catch (error) {
        console.error("Error loading location from storage:", error);
      }
    }

    if (!currentLocation) {
      showAlert(
        t("parking.noLocation"),
        t("parking.noLocationMessage"),
        "info"
      );
      return;
    }
    router.push("/compass");
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

  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <StatusIndicator
            variant="loading"
            title={t("permissions.requestingPermission")}
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
            title={t("permissions.locationDenied")}
            subtitle={t("permissions.locationDeniedMessage")}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView key={languageKey} style={styles.container}>
      {/* Background Lottie Animation */}
      <LottieView
        source={require("../assets/animations/Globe.json")}
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
          {/* Language Selector */}
          <View style={styles.languageSelectorContainer}>
            <LanguageSelector />
          </View>

          {/* Header */}
          <Animated.View style={[styles.header, headerAnimatedStyle]}>
            <Text style={styles.title}>
              🚗 {isParking ? t("parking.parkingHere") : t("parking.title")}
            </Text>
            <Text style={styles.subtitle}>
              {isParking
                ? t("parking.parkingActiveSubtitle")
                : t("parking.welcomeSubtitle")}
            </Text>
            {/* <Text>__DEV__: {__DEV__ ? 'true' : 'false'}</Text> */}
          </Animated.View>
          {/* <Text>adUnitId: {adUnitId}</Text>
          <Text>bannerAdUnitId: {bannerAdUnitId}</Text> */}
          {/* Status indicator */}
          <Animated.View style={[styles.statusContainer, statusAnimatedStyle]}>
            {isLoading ? (
              <StatusIndicator
                variant="loading"
                title={t("common.loading")}
                subtitle={t("common.pleaseWait")}
                animated
              />
            ) : isParking && location ? (
              <StatusIndicator
                variant="active"
                title={t("parking.parkingActive")}
                subtitle={t("parking.parkingActiveDescription")}
                icon="car-outline"
                animated
              />
            ) : (
              <StatusIndicator
                variant="inactive"
                title={t("parking.noParkingActive")}
                subtitle={t("parking.readyToStart")}
                icon="location-outline"
              />
            )}
          </Animated.View>

          {/* Parking Timer */}
          {isParking && parkingStartTime && (
            <Animated.View style={[styles.timerContainer, statusAnimatedStyle]}>
              <ParkingTimer startTime={parkingStartTime} isActive={isParking} />
            </Animated.View>
          )}

          {/* Action Buttons */}
          <Animated.View
            style={[styles.buttonsContainer, buttonsAnimatedStyle]}
          >
            {!isParking ? (
              <Button
                title={t("parking.startParking")}
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
                  title={t("parking.navigateToCar")}
                  onPress={navigateToLocation}
                  variant="success"
                  size="lg"
                  icon="navigate-outline"
                  disabled={isLoading}
                  style={styles.navigationButton}
                  fullWidth
                />

                {/* <Button
                  title={t('compass.openCompass')}
                  onPress={openCompass}
                  variant="primary"
                  size="lg"
                  icon="compass-outline"
                  disabled={isLoading}
                  style={styles.compassButton}
                  fullWidth
                /> */}

                <Button
                  title={t("parking.endParking")}
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
                ? t("parking.parkingInfoActive")
                : t("parking.parkingInfoInactive")}
            </Text>
          </Animated.View>
        </ScrollView>
      </BlurView>

      {/* Banner Ad - Above navigation bar */}
      <View style={[styles.bannerContainer, { paddingBottom: insets.bottom + 8 }]}>
        <BannerAd
          ref={bannerRef}
          unitId={bannerAdUnitId}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          onAdLoaded={() => console.log('✅ Banner Ad loaded')}
          onAdFailedToLoad={(error) => console.error('❌ Banner Ad failed to load:', error)}
          onAdOpened={() => console.log('🎯 Banner Ad opened')}
          onAdClosed={() => console.log('📱 Banner Ad closed')}
        />
      </View>

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  lottieBackground: {
    position: "absolute",
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
    paddingBottom: SPACING.xxxl + 120, // Extra space for banner ad above navigation bar
  },
  languageSelectorContainer: {
    alignSelf: "flex-end",
    marginBottom: SPACING.lg,
  },
  header: {
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSizes["4xl"],
    fontWeight: TYPOGRAPHY.fontWeights.extrabold as any,
    color: COLORS.text.primary,
    textAlign: "center",
    marginBottom: SPACING.sm,
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  } as TextStyle,
  subtitle: {
    fontSize: TYPOGRAPHY.fontSizes.lg,
    fontWeight: TYPOGRAPHY.fontWeights.medium as any,
    color: COLORS.text.secondary,
    textAlign: "center",
    lineHeight: TYPOGRAPHY.fontSizes.lg * TYPOGRAPHY.lineHeights.normal,
  } as TextStyle,
  statusContainer: {
    marginBottom: SPACING.xl,
  },
  timerContainer: {
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
  compassButton: {
    marginBottom: SPACING.md,
  },
  endButton: {
    opacity: 0.9,
  },
  infoContainer: {
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
  },
  infoText: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    fontWeight: TYPOGRAPHY.fontWeights.medium as any,
    color: COLORS.text.tertiary,
    textAlign: "center",
    lineHeight: TYPOGRAPHY.fontSizes.sm * TYPOGRAPHY.lineHeights.relaxed,
  } as TextStyle,
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.xl,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.xl,
  },
  bannerContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.9)",

    paddingHorizontal: SPACING.md,
    alignItems: "center",
    justifyContent: "center",
  },
});
