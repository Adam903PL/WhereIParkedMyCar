import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { Circle, Defs, G, Line, LinearGradient, Polygon, Stop, Svg } from "react-native-svg";
import { COLORS, SPACING, TYPOGRAPHY } from "../theme/designTokens";
import Button from "./components/ui/Button";

const { width } = Dimensions.get("window");
const SIZE = width * 0.8;

export default function CompassToTarget() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [target, setTarget] = useState<{ latitude: number; longitude: number } | null>(null);
  const [heading, setHeading] = useState<number>(0);
  const [directionToTarget, setDirectionToTarget] = useState<number>(0);
  const [distance, setDistance] = useState<number>(0);

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem("parkedLocation");
      if (saved) {
        const parsed = JSON.parse(saved);
        setTarget({
          latitude: parsed.latitude,
          longitude: parsed.longitude,
        });
      } else {
        alert("Nie znaleziono zapisanej lokalizacji!");
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Brak pozwolenia na lokalizację!");
        return;
      }

      Location.watchHeadingAsync((headingObj) => {
        setHeading(headingObj.trueHeading || 0);
      });

      Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 1 },
        (loc) => {
          setLocation(loc);
        }
      );
    })();
  }, []);

  useEffect(() => {
    if (location && target) {
      const lat1 = (location.coords.latitude * Math.PI) / 180;
      const lon1 = (location.coords.longitude * Math.PI) / 180;
      const lat2 = (target.latitude * Math.PI) / 180;
      const lon2 = (target.longitude * Math.PI) / 180;

      const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
      const x =
        Math.cos(lat1) * Math.sin(lat2) -
        Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);

      let bearing = (Math.atan2(y, x) * 180) / Math.PI;
      if (bearing < 0) bearing += 360;
      setDirectionToTarget(bearing);

      const R = 6371000;
      const dLat = lat2 - lat1;
      const dLon = lon2 - lon1;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const dist = R * c;
      setDistance(dist);
    }
  }, [location, target]);

  const rotation = directionToTarget - heading;
  const centerX = SIZE / 2;
  const centerY = SIZE / 2;

  if (!target) return (
    <View style={styles.container}>
      <Text style={styles.loadingText}>Ładowanie lokalizacji celu...</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧭 Kompas do samochodu</Text>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          Kierunek: {heading.toFixed(1)}° | Cel: {directionToTarget.toFixed(1)}°
        </Text>
        <Text style={styles.distanceText}>Odległość: {distance.toFixed(1)} m</Text>
      </View>

      <Svg width={SIZE} height={SIZE} style={styles.compass}>
        <Defs>
          <LinearGradient id="arrowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={COLORS.error[400]} />
            <Stop offset="100%" stopColor={COLORS.error[600]} />
          </LinearGradient>
          <LinearGradient id="compassGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={COLORS.background.secondary} />
            <Stop offset="100%" stopColor={COLORS.background.primary} />
          </LinearGradient>
        </Defs>
        
        {/* Zewnętrzne pierścienie kompasu */}
        <Circle
          cx={centerX}
          cy={centerY}
          r={SIZE / 2 - 5}
          stroke={COLORS.primary[600]}
          strokeWidth={4}
          fill="url(#compassGradient)"
        />
        <Circle
          cx={centerX}
          cy={centerY}
          r={SIZE / 2 - 15}
          stroke={COLORS.primary[400]}
          strokeWidth={2}
          fill="transparent"
        />
        
        {/* Znaczniki kierunków głównych */}
        {[0, 90, 180, 270].map((angle, index) => {
          const letters = ['N', 'E', 'S', 'W'];
          const radian = (angle * Math.PI) / 180;
          const x = centerX + Math.sin(radian) * (SIZE / 2 - 35);
          const y = centerY - Math.cos(radian) * (SIZE / 2 - 35);
          
          return (
            <G key={angle}>
              <Line
                x1={centerX + Math.sin(radian) * (SIZE / 2 - 20)}
                y1={centerY - Math.cos(radian) * (SIZE / 2 - 20)}
                x2={centerX + Math.sin(radian) * (SIZE / 2 - 30)}
                y2={centerY - Math.cos(radian) * (SIZE / 2 - 30)}
                stroke={COLORS.text.secondary}
                strokeWidth={3}
              />
            </G>
          );
        })}
        
        {/* Strzałka wskazująca kierunek do celu */}
        <G rotation={rotation} origin={`${centerX}, ${centerY}`}>
          {/* Główna część strzałki */}
          <Polygon
            points={`${centerX},30 ${centerX-8},50 ${centerX-3},50 ${centerX-3},${centerY+60} ${centerX+3},${centerY+60} ${centerX+3},50 ${centerX+8},50`}
            fill="url(#arrowGradient)"
            stroke={COLORS.error[700]}
            strokeWidth={1}
          />
          
          {/* Grotka strzałki */}
          <Polygon
            points={`${centerX},25 ${centerX-12},50 ${centerX+12},50`}
            fill={COLORS.error[500]}
            stroke={COLORS.error[700]}
            strokeWidth={2}
          />
          
          {/* Tylna część strzałki (ogon) */}
          <Polygon
            points={`${centerX-6},${centerY+60} ${centerX+6},${centerY+60} ${centerX},${centerY+80}`}
            fill={COLORS.error[300]}
            stroke={COLORS.error[600]}
            strokeWidth={1}
          />
        </G>
        
        {/* Centralny punkt kompasu */}
        <Circle
          cx={centerX}
          cy={centerY}
          r={8}
          fill={COLORS.primary[500]}
          stroke={COLORS.primary[700]}
          strokeWidth={2}
        />
        <Circle
          cx={centerX}
          cy={centerY}
          r={4}
          fill={COLORS.background.primary}
        />
      </Svg>

      <Text style={styles.description}>Strzałka wskazuje kierunek do zaparkowanego samochodu</Text>

      <Button
        title="Powrót do głównej"
        onPress={() => router.push('/')}
        variant="ghost"
        size="md"
        icon="arrow-back-outline"
        style={styles.backButton}
        fullWidth
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
    backgroundColor: COLORS.background.primary,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSizes["2xl"],
    fontWeight: TYPOGRAPHY.fontWeights.bold as any,
    color: COLORS.text.primary,
    textAlign: "center",
    marginBottom: SPACING.lg,
  },
  infoContainer: {
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  infoText: {
    fontSize: TYPOGRAPHY.fontSizes.base,
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm,
  },
  distanceText: {
    fontSize: TYPOGRAPHY.fontSizes.lg,
    fontWeight: TYPOGRAPHY.fontWeights.semibold as any,
    color: COLORS.success[500],
  },
  compass: {
    marginVertical: SPACING.xl,
    elevation: 5,
    shadowColor: COLORS.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  description: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    color: COLORS.text.tertiary,
    textAlign: "center",
    marginBottom: SPACING.xl,
    maxWidth: '80%',
  },
  loadingText: {
    fontSize: TYPOGRAPHY.fontSizes.lg,
    color: COLORS.text.secondary,
    textAlign: "center",
  },
  backButton: {
    marginTop: SPACING.lg,
  },
});