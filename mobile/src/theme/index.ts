export { colors, palette } from './colors';
export type { ColorToken } from './colors';

export {
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  textPresets,
} from './typography';

export { spacing, radius, borderWidth, shadow } from './spacing';
export type { SpacingKey } from './spacing';

// Unified theme object — useful if you later wrap this in a ThemeContext.
import { colors } from './colors';
import { fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, textPresets } from './typography';
import { spacing, radius, borderWidth, shadow } from './spacing';

export const theme = {
  colors,
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  textPresets,
  spacing,
  radius,
  borderWidth,
  shadow,
} as const;

export type Theme = typeof theme;
