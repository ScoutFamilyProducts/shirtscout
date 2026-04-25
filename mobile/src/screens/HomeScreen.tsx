import React, { useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import SearchBar from '@/components/SearchBar';
import TagChip from '@/components/TagChip';
import { colors, palette, textPresets, spacing, radius } from '@/theme';

const SUGGESTED_TAGS = ['Funny', 'Golf', 'Crypto', 'Vintage', 'Oregon'];

interface Props {
  onSearch?: (query: string) => void;
  onAbout?: () => void;
}

export default function HomeScreen({ onSearch, onAbout }: Props) {
  const [query, setQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // Fade in the whole screen on mount
  const screenOpacity = useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.timing(screenOpacity, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  function handleSubmit() {
    const q = query.trim();
    if (!q) return;
    onSearch?.(q);
    // TODO: navigate to search results screen
  }

  function handleTagPress(tag: string) {
    setActiveTag(tag);
    setQuery(tag);
    onSearch?.(tag);
    // TODO: navigate to search results screen
  }

  return (
    <Animated.View style={[styles.root, { opacity: screenOpacity }]}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Header ─────────────────────────────────────── */}
          <View style={styles.header}>
            <LinearGradient
              colors={[`${palette.neonGreen}18`, `${palette.softViolet}12`]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoBadge}
            >
              <Ionicons name="shirt-outline" size={17} color={palette.neonGreen} />
            </LinearGradient>
            <Text style={styles.headerWordmark}>ShirtScout</Text>
            <View style={styles.headerSpacer} />
            <Pressable onPress={onAbout} hitSlop={12} style={styles.aboutBtn}>
              <Ionicons name="information-circle-outline" size={22} color={colors.textSecondary} />
            </Pressable>
          </View>

          {/* ── Hero copy ──────────────────────────────────── */}
          <View style={styles.hero}>
            <Text style={styles.heroHeading}>
              Find your next{'\n'}
              <Text style={styles.heroAccent}>favorite tee.</Text>
            </Text>
            <Text style={styles.heroSubtitle}>
              No social required. No algorithm nonsense.
            </Text>
          </View>

          {/* ── Search bar ─────────────────────────────────── */}
          <View style={styles.searchWrapper}>
            <SearchBar
              value={query}
              onChangeText={(t) => { setQuery(t); setActiveTag(null); }}
              onSubmit={handleSubmit}
            />
          </View>

          {/* ── Suggested tags ─────────────────────────────── */}
          <View style={styles.tagsSection}>
            <Text style={styles.tagsLabel}>TRY SEARCHING FOR</Text>
            <View style={styles.tagsRow}>
              {SUGGESTED_TAGS.map((tag) => (
                <TagChip
                  key={tag}
                  label={tag}
                  active={activeTag === tag}
                  onPress={() => handleTagPress(tag)}
                />
              ))}
            </View>
          </View>

          {/* ── Helper text ────────────────────────────────── */}
          <Text style={styles.helperText}>
            ShirtScout searches Walmart, eBay, and Amazon simultaneously so you
            see every deal — sorted by price — in one place.
          </Text>

          {/* ── Decorative divider ─────────────────────────── */}
          <View style={styles.divider} />

          {/* ── Retailer pills (informational only) ────────── */}
          <View style={styles.retailerRow}>
            {['Walmart', 'eBay', 'Amazon'].map((name) => (
              <View key={name} style={styles.retailerPill}>
                <Text style={styles.retailerPillText}>{name}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  safeArea: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[4],
    paddingBottom: spacing[16],
    gap: spacing[6],
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  logoBadge: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: `${palette.neonGreen}38`,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  headerWordmark: {
    ...textPresets.subheading,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  headerSpacer: {
    flex: 1,
  },
  aboutBtn: {
    padding: spacing[1],
  },

  // Hero
  hero: {
    gap: spacing[2],
  },
  heroHeading: {
    ...textPresets.displaySmall,
    color: colors.textPrimary,
    lineHeight: 36,
  },
  heroAccent: {
    color: colors.accentPrimary,
  },

  heroSubtitle: {
    ...textPresets.body,
    color: colors.textSecondary,
  },

  // Search
  searchWrapper: {
    marginTop: -spacing[2],
  },

  // Tags
  tagsSection: {
    gap: spacing[3],
  },
  tagsLabel: {
    ...textPresets.overline,
    color: colors.textSecondary,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },

  // Helper
  helperText: {
    ...textPresets.caption,
    color: colors.textSecondary,
    lineHeight: 19,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
    marginVertical: -spacing[2],
  },

  // Retailer pills (informational only — no tap action)
  retailerRow: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  retailerPill: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: radius.full,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  retailerPillText: {
    ...textPresets.caption,
    color: colors.textSecondary,
  },
});
