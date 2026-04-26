import React from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, palette, textPresets, spacing, radius, borderWidth } from '@/theme';

const VERSION = '0.1.0';
const FEEDBACK_EMAIL = 'scoutfamilyproducts@gmail.com';
const FEEDBACK_SUBJECT = 'ShirtScout Feedback';
const WEBSITE_URL = 'https://scoutfamilyproducts.com';

function openFeedback() {
  Linking.openURL(
    `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(FEEDBACK_SUBJECT)}`
  ).catch(() => {});
}

function openWebsite() {
  Linking.openURL(WEBSITE_URL).catch(() => {});
}

interface Props {
  onBack: () => void;
}

export default function AboutScreen({ onBack }: Props) {
  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />

        {/* ── Header ── */}
        <View style={styles.header}>
          <Pressable onPress={onBack} style={styles.backBtn} hitSlop={12}>
            <Ionicons name="chevron-back" size={20} color={colors.textSecondary} />
          </Pressable>
          <Text style={styles.headerTitle}>About</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Logo ── */}
          <View style={styles.logoSection}>
            <LinearGradient
              colors={[`${palette.neonGreen}18`, `${palette.softViolet}12`]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoBadge}
            >
              <Ionicons name="shirt-outline" size={32} color={palette.neonGreen} />
            </LinearGradient>
            <Text style={styles.appName}>ShirtScout</Text>
            <Text style={styles.tagline}>Find shirts. Not noise.</Text>
          </View>

          {/* ── Info card ── */}
          <View style={styles.card}>
            <InfoRow label="Version" value={VERSION} />
            <View style={styles.rowDivider} />
            <InfoRow label="Made by" value="Scout Family Products" />
          </View>

          {/* ── Feedback ── */}
          <View style={styles.feedbackSection}>
            <Pressable style={styles.feedbackBtn} onPress={openFeedback}>
              <Ionicons name="mail-outline" size={18} color={palette.darkBase} />
              <Text style={styles.feedbackBtnText}>Send Feedback</Text>
            </Pressable>
            <Text style={styles.feedbackEmail}>{FEEDBACK_EMAIL}</Text>
            <Pressable style={styles.websiteLink} onPress={openWebsite}>
              <Ionicons name="globe-outline" size={14} color={palette.softViolet} />
              <Text style={styles.websiteLinkText}>scoutfamilyproducts.com</Text>
            </Pressable>
          </View>

          {/* ── Copyright ── */}
          <Text style={styles.copyright}>
            © 2026 Scout Family Products. All rights reserved.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
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
    borderWidth: borderWidth.thin,
    borderColor: `${palette.softViolet}28`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...textPresets.subheading,
    color: colors.textPrimary,
  },

  // Scroll
  scroll: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[16],
    gap: spacing[6],
  },

  // Logo section
  logoSection: {
    alignItems: 'center',
    gap: spacing[3],
    paddingTop: spacing[8],
  },
  logoBadge: {
    width: 80,
    height: 80,
    borderRadius: radius['2xl'],
    borderWidth: borderWidth.thin,
    borderColor: `${palette.neonGreen}38`,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  appName: {
    ...textPresets.heading,
    color: colors.textPrimary,
  },
  tagline: {
    ...textPresets.body,
    color: colors.textSecondary,
  },

  // Info card
  card: {
    alignSelf: 'stretch',
    backgroundColor: colors.bgSurface,
    borderRadius: radius.xl,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
  },
  rowDivider: {
    height: borderWidth.hairline,
    backgroundColor: colors.borderSubtle,
    marginHorizontal: spacing[4],
  },
  rowLabel: {
    ...textPresets.body,
    color: colors.textSecondary,
    flex: 1,
  },
  rowValue: {
    ...textPresets.body,
    color: colors.textPrimary,
    fontWeight: '500',
    flexShrink: 0,
  },

  // Feedback
  feedbackSection: {
    alignItems: 'center',
    gap: spacing[2],
  },
  feedbackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: palette.neonGreen,
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[3],
    borderRadius: radius.full,
  },
  feedbackBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: palette.darkBase,
    letterSpacing: 0.2,
  },
  feedbackEmail: {
    ...textPresets.caption,
    color: colors.textSecondary,
  },
  websiteLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    marginTop: spacing[1],
  },
  websiteLinkText: {
    ...textPresets.caption,
    color: palette.softViolet,
  },

  // Copyright
  copyright: {
    ...textPresets.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
