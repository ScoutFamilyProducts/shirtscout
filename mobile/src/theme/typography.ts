import { Platform } from 'react-native';

// System font stacks — no custom fonts loaded yet; easy to swap later.
export const fontFamily = {
  sans: Platform.select({
    ios:     'System',
    android: 'Roboto',
    default: 'System',
  }),
  mono: Platform.select({
    ios:     'Courier New',
    android: 'monospace',
    default: 'monospace',
  }),
} as const;

export const fontSize = {
  xs:   11,
  sm:   13,
  md:   15,   // body default
  lg:   17,
  xl:   20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
} as const;

export const fontWeight = {
  regular:  '400',
  medium:   '500',
  semibold: '600',
  bold:     '700',
} as const;

export const lineHeight = {
  tight:   1.2,
  normal:  1.5,
  relaxed: 1.75,
} as const;

export const letterSpacing = {
  tight:  -0.5,
  normal:  0,
  wide:    0.5,
  wider:   1,
  widest:  2,
} as const;

// Pre-composed text style presets so screens don't hand-roll common combos.
export const textPresets = {
  displayLarge: {
    fontFamily: fontFamily.sans,
    fontSize:   fontSize['4xl'],
    fontWeight: fontWeight.bold,
    lineHeight: fontSize['4xl'] * lineHeight.tight,
    letterSpacing: letterSpacing.tight,
  },
  displaySmall: {
    fontFamily: fontFamily.sans,
    fontSize:   fontSize['3xl'],
    fontWeight: fontWeight.bold,
    lineHeight: fontSize['3xl'] * lineHeight.tight,
    letterSpacing: letterSpacing.tight,
  },
  heading: {
    fontFamily: fontFamily.sans,
    fontSize:   fontSize['2xl'],
    fontWeight: fontWeight.semibold,
    lineHeight: fontSize['2xl'] * lineHeight.normal,
  },
  subheading: {
    fontFamily: fontFamily.sans,
    fontSize:   fontSize.xl,
    fontWeight: fontWeight.semibold,
    lineHeight: fontSize.xl * lineHeight.normal,
  },
  bodyLarge: {
    fontFamily: fontFamily.sans,
    fontSize:   fontSize.lg,
    fontWeight: fontWeight.regular,
    lineHeight: fontSize.lg * lineHeight.normal,
  },
  body: {
    fontFamily: fontFamily.sans,
    fontSize:   fontSize.md,
    fontWeight: fontWeight.regular,
    lineHeight: fontSize.md * lineHeight.normal,
  },
  caption: {
    fontFamily: fontFamily.sans,
    fontSize:   fontSize.sm,
    fontWeight: fontWeight.regular,
    lineHeight: fontSize.sm * lineHeight.normal,
  },
  label: {
    fontFamily: fontFamily.sans,
    fontSize:   fontSize.sm,
    fontWeight: fontWeight.semibold,
    letterSpacing: letterSpacing.wide,
  },
  overline: {
    fontFamily: fontFamily.sans,
    fontSize:   fontSize.xs,
    fontWeight: fontWeight.semibold,
    letterSpacing: letterSpacing.widest,
  },
  price: {
    fontFamily: fontFamily.sans,
    fontSize:   fontSize.lg,
    fontWeight: fontWeight.bold,
    letterSpacing: letterSpacing.tight,
  },
} as const;
