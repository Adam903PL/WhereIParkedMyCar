// components/ui/ParkingTimer.tsx
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SPACING } from '../../../theme/designTokens';

interface ParkingTimerProps {
  startTime: number;
  isActive: boolean;
  style?: ViewStyle;
}

const ParkingTimer: React.FC<ParkingTimerProps> = ({
  startTime,
  isActive,
  style,
}) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [displayTime, setDisplayTime] = useState({ hours: 0, minutes: 0, seconds: 0 });

  // Animation values
  const pulseScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.3);
  const clockRotation = useSharedValue(0);
  const borderScale = useSharedValue(1);

  useEffect(() => {
    if (isActive) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.01, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );

      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 2500 }),
          withTiming(0.4, { duration: 2500 })
        ),
        -1,
        true
      );

      clockRotation.value = withRepeat(
        withTiming(360, { duration: 20000, easing: Easing.linear }),
        -1
      );

      borderScale.value = withRepeat(
        withSequence(
          withTiming(1.02, { duration: 1800 }),
          withTiming(1, { duration: 1800 })
        ),
        -1,
        true
      );
    } else {
      pulseScale.value = withTiming(1);
      glowOpacity.value = withTiming(0);
      clockRotation.value = withTiming(0);
      borderScale.value = withTiming(1);
    }
  }, [isActive]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (isActive && startTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - startTime) / 1000);
        setElapsedTime(elapsed);

        const hours = Math.floor(elapsed / 3600);
        const minutes = Math.floor((elapsed % 3600) / 60);
        const seconds = elapsed % 60;

        setDisplayTime({ hours, minutes, seconds });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, startTime]);

  const getTimerVariant = () => {
    if (!isActive) return 'inactive';
    
    if (elapsedTime < 3600) return 'normal';
    if (elapsedTime < 14400) return 'warning';
    return 'danger';
  };

  const getVariantConfig = () => {
    const variant = getTimerVariant();
    
    switch (variant) {
      case 'normal':
        return {
          backgroundColor: 'rgba(16, 185, 129, 0.08)',
          borderColor: 'rgba(16, 185, 129, 0.25)',
          textColor: '#10B981',
          iconColor: '#10B981',
          shadowColor: '#10B981',
          glowColor: 'rgba(16, 185, 129, 0.4)',
          accentColor: '#10B981',
        };
      case 'warning':
        return {
          backgroundColor: 'rgba(245, 158, 11, 0.08)',
          borderColor: 'rgba(245, 158, 11, 0.25)',
          textColor: '#F59E0B',
          iconColor: '#F59E0B',
          shadowColor: '#F59E0B',
          glowColor: 'rgba(245, 158, 11, 0.4)',
          accentColor: '#F59E0B',
        };
      case 'danger':
        return {
          backgroundColor: 'rgba(239, 68, 68, 0.08)',
          borderColor: 'rgba(239, 68, 68, 0.25)',
          textColor: '#EF4444',
          iconColor: '#EF4444',
          shadowColor: '#EF4444',
          glowColor: 'rgba(239, 68, 68, 0.4)',
          accentColor: '#EF4444',
        };
      default:
        return {
          backgroundColor: 'rgba(148, 163, 184, 0.05)',
          borderColor: 'rgba(148, 163, 184, 0.15)',
          textColor: '#64748B',
          iconColor: '#64748B',
          shadowColor: '#64748B',
          glowColor: 'transparent',
          accentColor: '#64748B',
        };
    }
  };

  const config = getVariantConfig();

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    shadowColor: config.shadowColor,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: glowOpacity.value * 0.3,
    shadowRadius: 15,
    elevation: glowOpacity.value * 8,
  }));

  const clockAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${clockRotation.value}deg` }],
  }));

  const borderAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: borderScale.value }],
  }));

  const formatTimeUnit = (unit: number): string => {
    return unit.toString().padStart(2, '0');
  };

  return (
    <View style={[styles.wrapper, style]}>
      <Animated.View style={[styles.glowContainer, glowAnimatedStyle]}>
        <Animated.View style={[styles.borderContainer, borderAnimatedStyle]}>
          <Animated.View
            style={[
              styles.container,
              {
                backgroundColor: config.backgroundColor,
                borderColor: config.borderColor,
              },
              containerAnimatedStyle,
            ]}
          >
            <View style={styles.content}>
              <View style={styles.clockSection}>
                <Animated.View style={[styles.clockOuter, clockAnimatedStyle]}>
                  <View style={[styles.clockInner, { borderColor: config.accentColor }]}>
                    <Ionicons
                      name={isActive ? 'time' : 'time-outline'}
                      size={28}
                      color={config.iconColor}
                      style={styles.clockIcon}
                    />
                  </View>
                </Animated.View>
              </View>

              <View style={styles.timerSection}>
                <View style={styles.timeDisplay}>
                  <View style={styles.timeUnit}>
                    <Text style={[styles.timeNumber, { color: config.textColor }]}>
                      {formatTimeUnit(displayTime.hours)}
                    </Text>
                    <View style={[styles.labelContainer, { backgroundColor: config.accentColor }]}>
                      <Text style={styles.timeLabel}>H</Text>
                    </View>
                  </View>

                  <View style={styles.separatorContainer}>
                    <Text style={[styles.timeSeparator, { color: config.textColor }]}>:</Text>
                  </View>

                  <View style={styles.timeUnit}>
                    <Text style={[styles.timeNumber, { color: config.textColor }]}>
                      {formatTimeUnit(displayTime.minutes)}
                    </Text>
                    <View style={[styles.labelContainer, { backgroundColor: config.accentColor }]}>
                      <Text style={styles.timeLabel}>M</Text>
                    </View>
                  </View>

                  <View style={styles.separatorContainer}>
                    <Text style={[styles.timeSeparator, { color: config.textColor }]}>:</Text>
                  </View>

                  <View style={styles.timeUnit}>
                    <Text style={[styles.timeNumber, { color: config.textColor }]}>
                      {formatTimeUnit(displayTime.seconds)}
                    </Text>
                    <View style={[styles.labelContainer, { backgroundColor: config.accentColor }]}>
                      <Text style={styles.timeLabel}>S</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 350, // Match container width for consistent centering
    alignSelf: 'center', // Ensure wrapper is centered in parent
  },
  glowContainer: {
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  borderContainer: {
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    borderRadius: 16,
    borderWidth: 2,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg, // Added consistent horizontal padding
    width: 350, // Fixed width
    height: 100, // Fixed height
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  clockSection: {
    marginRight: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clockOuter: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clockInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  clockIcon: {
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  timerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: SPACING.sm, // Added to ensure even spacing
  },
  timeUnit: {
    alignItems: 'center',
    minWidth: 48,
    marginHorizontal: SPACING.xs,
  },
  timeNumber: {
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 32,
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: SPACING.sm,
  },
  labelContainer: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  separatorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: SPACING.xs,
  },
  timeSeparator: {
    fontSize: 24,
    fontWeight: '700',
    opacity: 0.6,
    lineHeight: 32,
  },
});

export default ParkingTimer;
