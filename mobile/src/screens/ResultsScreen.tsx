import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import ProductCard from '@/components/ProductCard';
import ProductSheet from '@/components/ProductSheet';
import SkeletonCard from '@/components/SkeletonCard';
import { MOCK_PRODUCTS } from '@/mocks/products';
import { Product, Retailer, SortOption, StoreFilter } from '@/types/product';
import { colors, palette, textPresets, spacing, radius, borderWidth, shadow } from '@/theme';
import { RETAILER_META } from '@/config/retailers';

const SKELETON_COUNT = 5;
const SIMULATED_LOAD_MS = 1500;

// ── Sort helpers ───────────────────────────────────────────────────────────

function sortProducts(products: Product[], sort: SortOption): Product[] {
  const copy = [...products];
  switch (sort) {
    case 'lowest-price':
      return copy.sort((a, b) => a.price - b.price);
    case 'highest-rated':
      return copy.sort((a, b) => {
        if (a.rating === null && b.rating === null) return 0;
        if (a.rating === null) return 1;
        if (b.rating === null) return -1;
        return b.rating - a.rating;
      });
    case 'best-match':
    default:
      return copy; // mock order is the "best match" order
  }
}

// ── Sort bar ───────────────────────────────────────────────────────────────

const SORT_OPTIONS: { key: SortOption; label: string; icon: React.ComponentProps<typeof Ionicons>['name'] }[] = [
  { key: 'best-match',    label: 'Best Match',    icon: 'sparkles-outline' },
  { key: 'lowest-price',  label: 'Lowest Price',  icon: 'arrow-down-outline' },
  { key: 'highest-rated', label: 'Highest Rated', icon: 'star-outline' },
];

function SortBar({
  selected,
  onChange,
}: {
  selected: SortOption;
  onChange: (s: SortOption) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.sortScroll}
    >
      {SORT_OPTIONS.map(({ key, label, icon }) => {
        const active = selected === key;
        return (
          <Pressable
            key={key}
            onPress={() => onChange(key)}
            style={[styles.sortChip, active && styles.sortChipActive]}
          >
            <Ionicons
              name={icon}
              size={13}
              color={active ? palette.darkBase : colors.textSecondary}
            />
            <Text style={[styles.sortChipText, active && styles.sortChipTextActive]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

// ── Store filter bar ────────────────────────────────────────────────────────

const STORE_OPTIONS: { key: StoreFilter; label: string }[] = [
  { key: 'all',     label: 'All' },
  { key: 'walmart', label: 'Walmart' },
  { key: 'ebay',    label: 'eBay' },
  { key: 'amazon',  label: 'Amazon' },
];

function StoreFilterBar({
  selected,
  counts,
  onChange,
}: {
  selected: StoreFilter;
  counts: Record<StoreFilter, number>;
  onChange: (s: StoreFilter) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.storeScroll}
    >
      {STORE_OPTIONS.map(({ key, label }) => {
        const active = selected === key;
        const dotColor = key === 'all' ? palette.softViolet : RETAILER_META[key as Retailer].color;
        const count = counts[key];

        return (
          <Pressable
            key={key}
            onPress={() => onChange(key)}
            style={[styles.storeChip, active && styles.storeChipActive]}
          >
            <View style={[styles.storeDot, { backgroundColor: active ? dotColor : colors.borderSubtle }]} />
            <Text style={[styles.storeChipText, active && styles.storeChipTextActive]}>
              {label}
            </Text>
            {count > 0 && (
              <View style={[styles.storeCount, active && styles.storeCountActive]}>
                <Text style={[styles.storeCountText, active && styles.storeCountTextActive]}>
                  {count}
                </Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

// ── Results screen ──────────────────────────────────────────────────────────

interface Props {
  query: string;
  onBack: () => void;
}

export default function ResultsScreen({ query, onBack }: Props) {
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortOption>('best-match');
  const [storeFilter, setStoreFilter] = useState<StoreFilter>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const listOpacity = useRef(new Animated.Value(0)).current;

  // Simulate API load
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      Animated.timing(listOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, SIMULATED_LOAD_MS);
    return () => clearTimeout(timer);
  }, []);

  // Filtered + sorted product list
  const filteredProducts = useMemo(() => {
    const filtered = storeFilter === 'all'
      ? MOCK_PRODUCTS
      : MOCK_PRODUCTS.filter((p) => p.retailer === storeFilter);
    return sortProducts(filtered, sort);
  }, [sort, storeFilter]);

  // Count per store for the filter bar badges
  const storeCounts = useMemo((): Record<StoreFilter, number> => ({
    all:     MOCK_PRODUCTS.length,
    walmart: MOCK_PRODUCTS.filter((p) => p.retailer === 'walmart').length,
    ebay:    MOCK_PRODUCTS.filter((p) => p.retailer === 'ebay').length,
    amazon:  MOCK_PRODUCTS.filter((p) => p.retailer === 'amazon').length,
  }), []);

  // Reset to best-match when store filter changes
  function handleStoreChange(s: StoreFilter) {
    setStoreFilter(s);
  }

  const renderItem = useCallback(({ item }: { item: Product }) => (
    <ProductCard product={item} onPress={setSelectedProduct} />
  ), []);

  const keyExtractor = useCallback((item: Product) => item.id, []);

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />

        {/* ── Header ───────────────────────────────────────────── */}
        <View style={styles.header}>
          <Pressable onPress={onBack} style={styles.backBtn} hitSlop={12}>
            <Ionicons name="arrow-back-outline" size={22} color={colors.textPrimary} />
          </Pressable>

          <View style={styles.headerCenter}>
            <Text style={styles.headerQuery} numberOfLines={1}>
              "{query}"
            </Text>
            {!loading && (
              <Text style={styles.headerCount}>
                {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''}
              </Text>
            )}
          </View>
        </View>

        {/* ── Sort bar ──────────────────────────────────────────── */}
        <View style={styles.sortBarWrapper}>
          <SortBar selected={sort} onChange={setSort} />
        </View>

        {/* ── Store filter bar ──────────────────────────────────── */}
        <View style={styles.storeBarWrapper}>
          <StoreFilterBar
            selected={storeFilter}
            counts={storeCounts}
            onChange={handleStoreChange}
          />
        </View>

        {/* ── Thin separator ────────────────────────────────────── */}
        <View style={styles.separator} />

        {/* ── List ──────────────────────────────────────────────── */}
        {loading ? (
          <FlatList
            data={Array.from({ length: SKELETON_COUNT }, (_, i) => i)}
            keyExtractor={(i) => String(i)}
            renderItem={({ index }) => <SkeletonCard index={index} />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <Animated.View style={[styles.listContainer, { opacity: listOpacity }]}>
            <FlatList
              data={filteredProducts}
              keyExtractor={keyExtractor}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={<EmptyState storeFilter={storeFilter} />}
            />
          </Animated.View>
        )}
      </SafeAreaView>

      <ProductSheet
        visible={selectedProduct !== null}
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </View>
  );
}

// ── Empty state ─────────────────────────────────────────────────────────────

function EmptyState({ storeFilter }: { storeFilter: StoreFilter }) {
  return (
    <View style={styles.empty}>
      <Ionicons name="search-outline" size={48} color={colors.borderSubtle} />
      <Text style={styles.emptyTitle}>No results</Text>
      <Text style={styles.emptyBody}>
        {storeFilter !== 'all'
          ? `Try switching to "All" to see results from other stores.`
          : `No shirts found. Try a different search term.`}
      </Text>
    </View>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  safeArea: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingTop: spacing[2],
    paddingBottom: spacing[3],
    gap: spacing[3],
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.bgSurface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.sm,
  },
  headerCenter: {
    flex: 1,
    gap: 2,
  },
  headerQuery: {
    ...textPresets.subheading,
    color: colors.textPrimary,
  },
  headerCount: {
    ...textPresets.caption,
    color: colors.textSecondary,
  },

  // Sort bar
  sortBarWrapper: {
    paddingBottom: spacing[2],
  },
  sortScroll: {
    paddingHorizontal: spacing[4],
    gap: spacing[2],
  },
  sortChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: radius.full,
    backgroundColor: colors.bgSurface,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
  },
  sortChipActive: {
    backgroundColor: palette.neonGreen,
    borderColor: palette.neonGreen,
    ...shadow.glow,
  },
  sortChipText: {
    ...textPresets.label,
    color: colors.textSecondary,
    fontSize: 12,
  },
  sortChipTextActive: {
    color: palette.darkBase,
  },

  // Store filter bar
  storeBarWrapper: {
    paddingBottom: spacing[2],
  },
  storeScroll: {
    paddingHorizontal: spacing[4],
    gap: spacing[2],
  },
  storeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: radius.full,
    backgroundColor: colors.bgSurface,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
  },
  storeChipActive: {
    backgroundColor: colors.bgSurface,
    borderColor: colors.accentSecondary,
  },
  storeDot: {
    width: 7,
    height: 7,
    borderRadius: radius.full,
  },
  storeChipText: {
    ...textPresets.label,
    color: colors.textSecondary,
    fontSize: 12,
  },
  storeChipTextActive: {
    color: colors.textPrimary,
  },
  storeCount: {
    minWidth: 18,
    height: 16,
    borderRadius: radius.full,
    backgroundColor: colors.bgOverlay,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  storeCountActive: {
    backgroundColor: `${palette.softViolet}30`,
  },
  storeCountText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  storeCountTextActive: {
    color: palette.softViolet,
  },

  // Separator
  separator: {
    height: borderWidth.hairline,
    backgroundColor: colors.borderSubtle,
    marginHorizontal: spacing[4],
    marginBottom: spacing[2],
  },

  // List
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[16],
  },

  // Empty state
  empty: {
    alignItems: 'center',
    paddingTop: spacing[16],
    gap: spacing[3],
    paddingHorizontal: spacing[8],
  },
  emptyTitle: {
    ...textPresets.subheading,
    color: colors.textPrimary,
  },
  emptyBody: {
    ...textPresets.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
