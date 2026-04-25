// 4 px base grid. Keys are multipliers so spacing[4] === 16 px.
export const spacing = {
  0:  0,
  1:  4,
  2:  8,
  3:  12,
  4:  16,
  5:  20,
  6:  24,
  7:  28,
  8:  32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
} as const;

export type SpacingKey = keyof typeof spacing;

export const radius = {
  sm:   4,
  md:   8,
  lg:   12,
  xl:   16,
  '2xl': 24,
  full: 9999,
} as const;

export const borderWidth = {
  hairline: 0.5,
  thin:     1,
  thick:    2,
} as const;

// Elevation shadows that match the dark theme (purple-tinted, not grey).
export const shadow = {
  none: {},
  sm: {
    shadowColor: '#2A0E4A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#2A0E4A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 6,
  },
  lg: {
    shadowColor: '#2A0E4A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 12,
  },
  // Neon glow used on highlighted / active elements.
  glow: {
    shadowColor: '#7CFF5B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
  },
} as const;
