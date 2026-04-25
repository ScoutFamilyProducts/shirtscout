import React from 'react';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';
import { StyleProp, ViewStyle } from 'react-native';

// Color slots — override to adapt Scout for other apps in the Scout family.
interface ScoutColors {
  primary: string;    // shirt, badge fill (brand CTA color)
  secondary: string;  // hat, cheeks (brand accent)
  skin: string;       // head, hands (neutral light)
  outline: string;    // stroke + dark details
  limb: string;       // arms, legs, shoes
}

interface Props {
  size?: number;
  style?: StyleProp<ViewStyle>;
  colors?: Partial<ScoutColors>;
}

const DEFAULTS: ScoutColors = {
  primary: '#7CFF5B',
  secondary: '#B388FF',
  skin: '#F5F2FA',
  outline: '#1B0A30',
  limb: '#2A0E4A',
};

// ViewBox: 200 × 220. Character fills top-to-bottom, centered at x=100.
// Pose: symmetric forward crouch — weight low, hands forward, ready to pounce.
// Hat magnifying-glass badge reinforces the "scouting" concept.
export default function ScoutMascot({ size = 160, style, colors }: Props) {
  const C: ScoutColors = { ...DEFAULTS, ...colors };
  const height = Math.round(size * 1.1);

  return (
    <Svg width={size} height={height} viewBox="0 0 200 220" style={style}>

      {/* ── Ground shadow ─────────────────────────────────── */}
      <Ellipse cx="100" cy="211" rx="50" ry="8" fill={C.outline} opacity="0.25" />

      {/* ── Shoes ─────────────────────────────────────────── */}
      <Ellipse cx="82"  cy="202" rx="18" ry="9" fill={C.limb} />
      <Ellipse cx="118" cy="202" rx="18" ry="9" fill={C.limb} />

      {/* ── Legs – bent in crouch ─────────────────────────── */}
      <Path d="M88,173 Q77,190 82,202"  stroke={C.limb} strokeWidth="20" strokeLinecap="round" fill="none" />
      <Path d="M112,173 Q123,190 118,202" stroke={C.limb} strokeWidth="20" strokeLinecap="round" fill="none" />

      {/* ── Shirt / body ──────────────────────────────────── */}
      <Ellipse cx="100" cy="150" rx="36" ry="26" fill={C.primary} stroke={C.outline} strokeWidth="1.5" />
      {/* V-neck collar */}
      <Path
        d="M93,127 L100,140 L107,127"
        stroke={C.outline}
        strokeWidth="2"
        fill="none"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* ── Arms – forward/down for crouching energy ──────── */}
      <Path d="M73,137 Q55,159 59,176"  stroke={C.limb} strokeWidth="18" strokeLinecap="round" fill="none" />
      <Path d="M127,137 Q145,159 141,176" stroke={C.limb} strokeWidth="18" strokeLinecap="round" fill="none" />

      {/* ── Hands ─────────────────────────────────────────── */}
      <Circle cx="59"  cy="176" r="9" fill={C.skin} stroke={C.outline} strokeWidth="1.5" />
      <Circle cx="141" cy="176" r="9" fill={C.skin} stroke={C.outline} strokeWidth="1.5" />

      {/* ── Neck ──────────────────────────────────────────── */}
      <Ellipse cx="100" cy="124" rx="10" ry="7" fill={C.skin} />

      {/* ── Head ──────────────────────────────────────────── */}
      <Circle cx="100" cy="85" r="36" fill={C.skin} stroke={C.outline} strokeWidth="1.5" />

      {/* ── Cheeks ────────────────────────────────────────── */}
      <Ellipse cx="75"  cy="97" rx="12" ry="7" fill={C.secondary} opacity="0.38" />
      <Ellipse cx="125" cy="97" rx="12" ry="7" fill={C.secondary} opacity="0.38" />

      {/* ── Eyes ──────────────────────────────────────────── */}
      <Circle cx="87"  cy="80" r="10" fill="white" stroke={C.outline} strokeWidth="1.5" />
      <Circle cx="113" cy="80" r="10" fill="white" stroke={C.outline} strokeWidth="1.5" />
      {/* Pupils shifted right – character is peering ahead */}
      <Circle cx="90"  cy="81" r="6" fill={C.outline} />
      <Circle cx="116" cy="81" r="6" fill={C.outline} />
      {/* Shine */}
      <Circle cx="92"  cy="78" r="2.5" fill="white" />
      <Circle cx="118" cy="78" r="2.5" fill="white" />

      {/* ── Eyebrows – arched up: alert and curious ───────── */}
      <Path d="M80,68 Q87,62 94,67"  stroke={C.outline} strokeWidth="3" strokeLinecap="round" fill="none" />
      <Path d="M106,67 Q113,62 120,68" stroke={C.outline} strokeWidth="3" strokeLinecap="round" fill="none" />

      {/* ── Smile ─────────────────────────────────────────── */}
      <Path d="M88,100 Q100,115 112,100" stroke={C.outline} strokeWidth="3" strokeLinecap="round" fill="none" />

      {/* ── Hat brim ──────────────────────────────────────── */}
      <Ellipse cx="100" cy="54" rx="43" ry="9" fill={C.secondary} stroke={C.outline} strokeWidth="1.5" />

      {/* ── Hat dome ──────────────────────────────────────── */}
      <Path
        d="M62,54 Q62,16 100,14 Q138,16 138,54 Z"
        fill={C.secondary}
        stroke={C.outline}
        strokeWidth="1.5"
      />

      {/* ── Hat badge – magnifying glass ──────────────────── */}
      <Circle cx="100" cy="38" r="10" fill={C.primary} stroke={C.outline} strokeWidth="1.5" />
      {/* Lens */}
      <Circle cx="99" cy="36" r="4" fill="none" stroke={C.outline} strokeWidth="1.5" />
      {/* Handle */}
      <Path d="M102,39 L106,43" stroke={C.outline} strokeWidth="1.5" strokeLinecap="round" fill="none" />

    </Svg>
  );
}
