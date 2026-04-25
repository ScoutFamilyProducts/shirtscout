import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Linking,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Product, Retailer } from '@/types/product';
import { colors, palette, textPresets, spacing, radius, borderWidth, shadow } from '@/theme';
import { RETAILER_META } from '@/config/retailers';

// ── Sub-components ──────────────────────────────────────────────────────────

function SheetImage({ product }: { product: Product }) {
  const [errored, setErrored] = useState(false);
  const { width } = useWindowDimensions();
  const { color, abbr, label } = RETAILER_META[product.retailer];
  const imageSize = width - spacing[5] * 2;

  if (!product.imageUrl || errored) {
    return (
      <LinearGradient
        colors={[`${color}22`, `${color}08`]}
        style={[styles.imagePlaceholder, { height: imageSize * 0.65 }]}
      >
        <Text style={[styles.imagePlaceholderAbbr, { color: `${color}50` }]}>
          {abbr}
        </Text>
        <Text style={[styles.imagePlaceholderLabel, { color: `${color}70` }]}>
          {label}
        </Text>
      </LinearGradient>
    );
  }

  return (
    <Image
      source={{ uri: product.imageUrl }}
      style={[styles.image, { height: imageSize * 0.65 }]}
      resizeMode="cover"
      onError={() => setErrored(true)}
    />
  );
}

function SheetStoreBadge({ retailer }: { retailer: Retailer }) {
  const { label, color } = RETAILER_META[retailer];
  return (
    <View style={[styles.badge, { borderColor: `${color}50` }]}>
      <View style={[styles.badgeDot, { backgroundColor: color }]} />
      <Text style={[styles.badgeLabel, { color }]}>{label}</Text>
    </View>
  );
}

function SheetRating({
  rating,
  reviewCount,
}: {
  rating: number | null;
  reviewCount: number | null;
}) {
  if (rating === null) return null;
  const count =
    reviewCount === null
      ? null
      : reviewCount >= 1000
      ? `${(reviewCount / 1000).toFixed(1)}k`
      : String(reviewCount);

  return (
    <View style={styles.ratingRow}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = rating >= star - 0.25;
        const half = !filled && rating >= star - 0.75;
        return (
          <Ionicons
            key={star}
            name={filled ? 'star' : half ? 'star-half-outline' : 'star-outline'}
            size={14}
            color={palette.neonGreen}
          />
        );
      })}
      <Text style={styles.ratingValue}>{rating.toFixed(1)}</Text>
      {count && <Text style={styles.ratingCount}>({count} reviews)</Text>}
    </View>
  );
}

function SheetShipping({ free }: { free: boolean }) {
  return (
    <View style={styles.shippingRow}>
      <Ionicons
        name={free ? 'checkmark-circle' : 'cube-outline'}
        size={16}
        color={free ? palette.neonGreen : colors.textSecondary}
      />
      <Text style={[styles.shippingText, !free && styles.shippingMuted]}>
        {free ? 'Free shipping available' : 'Standard shipping'}
      </Text>
    </View>
  );
}

// ── Main sheet ──────────────────────────────────────────────────────────────

interface Props {
  visible: boolean;
  product: Product | null;
  onClose: () => void;
}

export default function ProductSheet({ visible, product, onClose }: Props) {
  const { height: screenH } = useWindowDimensions();

  // Sheet is rendered inside a Modal; we keep it mounted during exit animation.
  const [isRendered, setIsRendered] = useState(false);

  // slideAnim drives show/hide; panY tracks live drag offset.
  // Both use useNativeDriver:false because Animated.event requires it for panY,
  // and Animated.add can't mix native/non-native drivers.
  const slideAnim = useRef(new Animated.Value(screenH)).current;
  const panY = useRef(new Animated.Value(0)).current;
  const combinedY = useRef(Animated.add(slideAnim, panY)).current;

  // Backdrop fades in as the sheet slides up.
  const backdropOpacity = useRef(
    combinedY.interpolate({
      inputRange: [0, screenH],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    })
  ).current;

  // CTA press scale animation.
  const ctaScale = useRef(new Animated.Value(1)).current;

  // ── Show / hide ────────────────────────────────────────────────────────

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(screenH);
      panY.setValue(0);
      setIsRendered(true);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: false,
        friction: 11,
        tension: 58,
      }).start();
    }
  }, [visible, screenH]);

  function dismiss() {
    Animated.timing(slideAnim, {
      toValue: screenH,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      panY.setValue(0);
      setIsRendered(false);
      onClose();
    });
  }

  // ── Drag-to-dismiss (handle area only) ─────────────────────────────────

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, { dy, dx }) =>
        Math.abs(dy) > Math.abs(dx) && dy > 6,
      onPanResponderGrant: () => {
        panY.extractOffset();
      },
      onPanResponderMove: Animated.event([null, { dy: panY }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, { dy, vy }) => {
        panY.flattenOffset();
        if (dy > 80 || vy > 0.9) {
          dismiss();
        } else {
          // Resist dragging upward — clamp to 0.
          Animated.spring(panY, {
            toValue: 0,
            useNativeDriver: false,
            friction: 9,
            tension: 80,
          }).start();
        }
      },
    })
  ).current;

  // ── CTA press ──────────────────────────────────────────────────────────

  function handleCTAPress() {
    if (!product) return;
    Animated.sequence([
      Animated.timing(ctaScale, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.spring(ctaScale, { toValue: 1, useNativeDriver: true, friction: 5 }),
    ]).start();
    const url = product.affiliateUrl ?? product.productUrl;
    Linking.openURL(url).catch(() => {
      // URL failed to open — silently ignore in mock environment
    });
  }

  // ── Render ─────────────────────────────────────────────────────────────

  if (!isRendered || !product) return null;

  const { retailer, title, price, freeShipping, rating, reviewCount } = product;
  const { label: retailerLabel } = RETAILER_META[retailer];
  const bottomInset = Platform.OS === 'ios' ? 34 : 20;

  return (
    <Modal
      visible={isRendered}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={dismiss}
    >
      {/* ── Backdrop ───────────────────────────────────────────── */}
      <Animated.View
        style={[styles.backdropLayer, { opacity: backdropOpacity }]}
        pointerEvents="none"
      />
      <Pressable style={styles.backdropPressable} onPress={dismiss} />

      {/* ── Sheet ──────────────────────────────────────────────── */}
      <Animated.View
        style={[styles.sheet, { transform: [{ translateY: combinedY }] }]}
      >
        {/* Drag handle — only this area activates swipe-to-dismiss */}
        <View style={styles.handleArea} {...panResponder.panHandlers}>
          <View style={styles.handlePill} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomInset + spacing[4] }]}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Image */}
          <SheetImage product={product} />

          {/* Store badge + title */}
          <View style={styles.section}>
            <SheetStoreBadge retailer={retailer} />
            <Text style={styles.title}>{title}</Text>
          </View>

          {/* Price */}
          <Text style={styles.price}>
            ${price.toFixed(2)}
          </Text>

          {/* Rating */}
          <SheetRating rating={rating} reviewCount={reviewCount} />

          {/* Shipping */}
          <SheetShipping free={freeShipping} />

          {/* Divider */}
          <View style={styles.divider} />

          {/* CTA button */}
          <Animated.View style={{ transform: [{ scale: ctaScale }] }}>
            <Pressable
              style={[styles.ctaButton, shadow.glow]}
              onPress={handleCTAPress}
            >
              <Ionicons
                name="open-outline"
                size={16}
                color={palette.darkBase}
                style={{ marginRight: spacing[2] }}
              />
              <Text style={styles.ctaText}>View on {retailerLabel}</Text>
            </Pressable>
          </Animated.View>

          {/* Disclaimer */}
          <Text style={styles.disclaimer}>
            Price and availability confirmed on retailer site.
          </Text>
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Backdrop
  backdropLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0D0520',
  },
  backdropPressable: {
    ...StyleSheet.absoluteFillObject,
  },

  // Sheet container
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.bgSurface,
    borderTopLeftRadius: radius['2xl'],
    borderTopRightRadius: radius['2xl'],
    borderTopWidth: borderWidth.thin,
    borderTopColor: colors.border,
    maxHeight: '90%',
    // Elevation for Android
    elevation: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
  },

  // Drag handle
  handleArea: {
    width: '100%',
    paddingTop: spacing[3],
    paddingBottom: spacing[2],
    alignItems: 'center',
  },
  handlePill: {
    width: 36,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.bgOverlay,
  },

  // Scroll
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: spacing[5],
    gap: spacing[4],
  },

  // Image
  image: {
    width: '100%',
    borderRadius: radius.xl,
  },
  imagePlaceholder: {
    width: '100%',
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[1],
  },
  imagePlaceholderAbbr: {
    fontSize: 72,
    fontWeight: '900',
    lineHeight: 80,
  },
  imagePlaceholderLabel: {
    ...textPresets.label,
    letterSpacing: 2,
  },

  // Section
  section: {
    gap: spacing[2],
  },

  // Store badge
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    alignSelf: 'flex-start',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: radius.full,
    borderWidth: borderWidth.thin,
    backgroundColor: `${colors.bgBase}80`,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: radius.full,
  },
  badgeLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  // Title
  title: {
    ...textPresets.bodyLarge,
    color: colors.textPrimary,
    lineHeight: 24,
  },

  // Price
  price: {
    fontSize: 32,
    fontWeight: '800',
    color: palette.neonGreen,
    letterSpacing: -1,
    marginTop: -spacing[1],
  },

  // Rating
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingValue: {
    ...textPresets.body,
    color: colors.textPrimary,
    fontWeight: '700',
    marginLeft: 2,
  },
  ratingCount: {
    ...textPresets.body,
    color: colors.textSecondary,
  },

  // Shipping
  shippingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  shippingText: {
    ...textPresets.body,
    color: palette.neonGreen,
    fontWeight: '500',
  },
  shippingMuted: {
    color: colors.textSecondary,
  },

  // Divider
  divider: {
    height: borderWidth.thin,
    backgroundColor: colors.borderSubtle,
  },

  // CTA button
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.neonGreen,
    borderRadius: radius.full,
    height: 54,
    gap: spacing[2],
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.darkBase,
    letterSpacing: 0.2,
  },

  // Disclaimer
  disclaimer: {
    ...textPresets.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: -spacing[2],
  },
});
