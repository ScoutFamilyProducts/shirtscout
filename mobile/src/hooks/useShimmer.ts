import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

// Returns a looping Animated.Value cycling 0.35 → 0.75 → 0.35.
// `delay` staggers cards so they don't all pulse in lockstep.
export function useShimmer(delay = 0) {
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 0.75,
            duration: 750,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.35,
            duration: 750,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, delay);

    return () => clearTimeout(timeout);
  }, [delay, opacity]);

  return opacity;
}
