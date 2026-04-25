import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useShimmer } from '@/hooks/useShimmer';
import { colors, spacing, radius } from '@/theme';

interface Props {
  index?: number;
}

function ShimRect({
  w,
  h,
  opacity,
  br = radius.sm,
}: {
  w: number | string;
  h: number;
  opacity: Animated.Value;
  br?: number;
}) {
  return (
    <Animated.View
      style={{
        width: w as number,
        height: h,
        borderRadius: br,
        backgroundColor: colors.bgOverlay,
        opacity,
      }}
    />
  );
}

export default function SkeletonCard({ index = 0 }: Props) {
  const opacity = useShimmer(index * 120);

  return (
    <View style={styles.card}>
      {/* Thumbnail */}
      <ShimRect w={88} h={88} opacity={opacity} br={radius.md} />

      {/* Text block */}
      <View style={styles.body}>
        {/* Store badge */}
        <ShimRect w={64} h={14} opacity={opacity} br={radius.full} />
        {/* Title line 1 */}
        <ShimRect w="90%" h={14} opacity={opacity} />
        {/* Title line 2 */}
        <ShimRect w="65%" h={14} opacity={opacity} />
        {/* Price */}
        <ShimRect w={72} h={20} opacity={opacity} br={radius.sm} />
        {/* Rating + shipping row */}
        <View style={styles.metaRow}>
          <ShimRect w={90} h={12} opacity={opacity} />
          <ShimRect w={100} h={12} opacity={opacity} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.bgSurface,
    borderRadius: radius.xl,
    padding: spacing[3],
    gap: spacing[3],
    marginBottom: spacing[3],
  },
  body: {
    flex: 1,
    gap: spacing[2],
    paddingTop: spacing[1],
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing[3],
    marginTop: spacing[1],
  },
});
