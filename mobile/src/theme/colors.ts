// Raw palette — these are the six brand-defined values, nothing else.
export const palette = {
  deepPurple:     '#2A0E4A',
  darkBase:       '#1B0A30',
  neonGreen:      '#7CFF5B',
  softViolet:     '#B388FF',
  offWhite:       '#F5F2FA',
  mutedGrayLilac: '#B9AEC9',
} as const;

// Semantic tokens — components reference these, never the palette directly.
// Keeping the alias layer here makes a future light-mode variant a one-file change.
export const colors = {
  // Backgrounds
  bgBase:       palette.darkBase,       // deepest background (screen, modals)
  bgSurface:    palette.deepPurple,     // cards, bottom sheets, list rows
  bgOverlay:    '#3D1A6E',              // elevated surfaces (popovers, toasts)

  // Brand accents
  accentPrimary:   palette.neonGreen,   // CTA buttons, badges, active tab
  accentSecondary: palette.softViolet,  // links, icons, secondary actions

  // Text
  textPrimary:    palette.offWhite,         // headings, body copy
  textSecondary:  palette.mutedGrayLilac,   // captions, placeholders, meta
  textInverse:    palette.darkBase,         // text on neon green buttons

  // UI chrome
  border:       '#3D1A6E',              // card edges, dividers
  borderSubtle: '#2A1F3D',              // very faint separators

  // Status
  success: palette.neonGreen,
  error:   '#FF5C5C',
  warning: '#FFD166',

  // Convenience re-exports so callers can do colors.palette.deepPurple if needed
  palette,
} as const;

export type ColorToken = keyof typeof colors;
