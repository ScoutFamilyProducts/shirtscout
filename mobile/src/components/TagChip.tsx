import React, { useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
} from 'react-native';
import { colors, textPresets, spacing, radius, borderWidth } from '@/theme';

interface Props {
  label: string;
  onPress: () => void;
  active?: boolean;
}

export default function TagChip({ label, onPress, active = false }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  function handlePressIn() {
    Animated.spring(scale, {
      toValue: 0.94,
      useNativeDriver: true,
      friction: 8,
    }).start();
  }

  function handlePressOut() {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
    }).start();
  }

  return (
    <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View
        style={[
          styles.chip,
          active && styles.chipActive,
          { transform: [{ scale }] },
        ]}
      >
        <Text style={[styles.label, active && styles.labelActive]}>
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: radius.full,
    backgroundColor: colors.bgSurface,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: `${colors.accentPrimary}1A`,
    borderColor: colors.accentPrimary,
  },
  label: {
    ...textPresets.label,
    color: colors.textSecondary,
  },
  labelActive: {
    color: colors.accentPrimary,
  },
});
