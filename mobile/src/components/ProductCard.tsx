import React, { useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product, Retailer } from '@/types/product';
import { colors, palette, textPresets, spacing, radius, shadow } from '@/theme';
import { RETAILER_META } from '@/config/retailers';

// ── Sub-components ──────────────────────────────────────────────────────────

function StoreBadge({ retailer }: { retailer: Retailer }) {
  const { label, color } = RETAILER_META[retailer];
  return (
    <View style={[styles.badge, { borderColor: `${color}50` }]}>
      <View style={[styles.badgeDot, { backgroundColor: color }]} />
      <Text style={[styles.badgeLabel, { color }]}>{label}</Text>
    </View>
  );
}

function ImageArea({ imageUrl, retailer }: { imageUrl: string | null; retailer: Retailer }) {
  const [errored, setErrored] = useState(false);
  const { color, abbr } = RETAILER_META[retailer];

  if (!imageUrl || errored) {
    return (
      <View style={[styles.imagePlaceholder, { backgroundColor: `${color}18` }]}>
        <Text style={[styles.imagePlaceholderText, { color }]}>{abbr}</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: imageUrl }}
      style={styles.image}
      resizeMode="cover"
      onError={() => setErrored(true)}
    />
  );
}

function Rating({ rating, reviewCount }: { rating: number | null; reviewCount: number | null }) {
  if (rating === null) return null;

  const formatted = reviewCount !== null
    ? reviewCount >= 1000
      ? `${(reviewCount / 1000).toFixed(1)}k`
      : String(reviewCount)
    : null;

  return (
    <View style={styles.ratingRow}>
      <Ionicons name="star" size={11} color={palette.neonGreen} />
      <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
      {formatted && (
        <Text style={styles.ratingCount}>({formatted})</Text>
      )}
    </View>
  );
}

function Shipping({ free }: { free: boolean }) {
  return (
    <View style={styles.shippingRow}>
      <Ionicons
        name={free ? 'checkmark-circle-outline' : 'cube-outline'}
        size={11}
        color={free ? palette.neonGreen : colors.textSecondary}
      />
      <Text style={[styles.shippingText, !free && styles.shippingTextMuted]}>
        {free ? 'Free shipping' : 'Standard shipping'}
      </Text>
    </View>
  );
}

// ── Main card ───────────────────────────────────────────────────────────────

interface Props {
  product: Product;
  onPress?: (product: Product) => void;
}

export default function ProductCard({ product, onPress }: Props) {
  const {
    retailer, title, price, currency,
    imageUrl, rating, reviewCount, freeShipping,
  } = product;

  return (
    <Pressable
      onPress={() => onPress?.(product)}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <ImageArea imageUrl={imageUrl} retailer={retailer} />

      <View style={styles.body}>
        <StoreBadge retailer={retailer} />

        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>

        <Text style={styles.price}>
          {currency === 'USD' ? '$' : currency}
          {price.toFixed(2)}
        </Text>

        <View style={styles.meta}>
          <Rating rating={rating} reviewCount={reviewCount} />
          <Shipping free={freeShipping} />
        </View>
      </View>
    </Pressable>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────

const IMAGE_SIZE = 88;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.bgSurface,
    borderRadius: radius.xl,
    padding: spacing[3],
    gap: spacing[3],
    marginBottom: spacing[3],
    ...shadow.sm,
  },
  cardPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },

  // Image
  image: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: radius.md,
  },
  imagePlaceholder: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 1,
  },

  // Body
  body: {
    flex: 1,
    gap: spacing[2],
    paddingTop: spacing[1],
  },

  // Store badge
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    alignSelf: 'flex-start',
    paddingHorizontal: spacing[2],
    paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: 1,
    backgroundColor: `${colors.bgBase}80`,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: radius.full,
  },
  badgeLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },

  // Title
  title: {
    ...textPresets.body,
    color: colors.textPrimary,
    lineHeight: 20,
  },

  // Price
  price: {
    ...textPresets.price,
    color: palette.neonGreen,
  },

  // Meta row (rating + shipping)
  meta: {
    gap: spacing[1],
    marginTop: spacing[1],
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    ...textPresets.caption,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  ratingCount: {
    ...textPresets.caption,
    color: colors.textSecondary,
  },
  shippingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  shippingText: {
    ...textPresets.caption,
    color: palette.neonGreen,
  },
  shippingTextMuted: {
    color: colors.textSecondary,
  },
});
