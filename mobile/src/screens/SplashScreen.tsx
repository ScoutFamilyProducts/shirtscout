import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, palette, textPresets, spacing, radius, shadow } from '@/theme';

interface Props {
  onDismiss: () => void;
}

// Renders a full-screen grid of neon lines behind the logo.
function NeonGrid({ width, height }: { width: number; height: number }) {
  const STEP = 65;
  const lines: React.ReactElement[] = [];

  for (let y = STEP; y < height; y += STEP) {
    lines.push(<View key={`h${y}`} style={[styles.hLine, { top: y, width }]} />);
  }
  for (let x = STEP; x < width; x += STEP) {
    lines.push(<View key={`v${x}`} style={[styles.vLine, { left: x, height }]} />);
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {lines}
    </View>
  );
}

export default function SplashScreen({ onDismiss }: Props) {
  const { width, height } = useWindowDimensions();
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.88)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 650,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 7,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(onDismiss, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient
      colors={[palette.darkBase, palette.deepPurple, '#3D1A6E']}
      start={{ x: 0.3, y: 1 }}
      end={{ x: 0.8, y: 0 }}
      style={styles.container}
    >
      <NeonGrid width={width} height={height} />

      <Animated.View
        style={[
          styles.content,
          { opacity: contentOpacity, transform: [{ scale: logoScale }] },
        ]}
      >
        {/* Logo mark */}
        <View style={[styles.badge, shadow.glow]}>
          <LinearGradient
            colors={[palette.deepPurple, '#4B1A8A']}
            style={styles.badgeGradient}
          >
            <Text style={styles.badgeText}>SS</Text>
          </LinearGradient>
        </View>

        {/* Wordmark */}
        <Text style={styles.wordmark}>ShirtScout</Text>

        {/* Tagline */}
        <Text style={styles.tagline}>Find shirts. Not noise.</Text>
      </Animated.View>

      {/* Subtle bottom glow */}
      <View style={styles.bottomGlow} pointerEvents="none" />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Grid lines
  hLine: {
    position: 'absolute',
    height: StyleSheet.hairlineWidth,
    backgroundColor: palette.neonGreen,
    opacity: 0.07,
  },
  vLine: {
    position: 'absolute',
    width: StyleSheet.hairlineWidth,
    backgroundColor: palette.neonGreen,
    opacity: 0.07,
  },

  // Content
  content: {
    alignItems: 'center',
    gap: spacing[3],
  },

  // Badge
  badge: {
    width: 80,
    height: 80,
    borderRadius: radius.xl,
    overflow: 'hidden',
    marginBottom: spacing[2],
  },
  badgeGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: `${palette.neonGreen}40`,
  },
  badgeText: {
    fontSize: 28,
    fontWeight: '800',
    color: palette.neonGreen,
    letterSpacing: 2,
  },

  // Wordmark
  wordmark: {
    ...textPresets.displayLarge,
    color: palette.offWhite,
    letterSpacing: -1.5,
  },

  // Tagline
  tagline: {
    ...textPresets.bodyLarge,
    color: palette.mutedGrayLilac,
    letterSpacing: 0.2,
    marginTop: spacing[1],
  },

  // Decorative bottom glow strip
  bottomGlow: {
    position: 'absolute',
    bottom: -60,
    width: 300,
    height: 120,
    borderRadius: 60,
    backgroundColor: palette.neonGreen,
    opacity: 0.06,
    // blur-like effect via large shadow
    ...shadow.glow,
  },
});
