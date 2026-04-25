import React from 'react';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';
import { StyleProp, ViewStyle } from 'react-native';

// ── Color system ────────────────────────────────────────────────────────────
//
// Scout is a shared character across all apps in the Scout family.
// Each app only needs to override `primary` and `secondary` to re-skin him:
//
//   <ScoutMascot colors={{ primary: '#FF6B35', secondary: '#4ECDC4' }} />
//
// `skin`, `outline`, and `limb` rarely need changing but are exposed for
// apps with unusual dark/light themes.
//
interface ScoutColors {
  primary: string;    // shirt + hat badge   ← your app's CTA color
  secondary: string;  // hat + cheeks        ← your app's accent color
  skin: string;       // face + hands
  outline: string;    // all strokes / dark detail
  limb: string;       // arms, legs, shoes
}

interface Props {
  size?: number;
  style?: StyleProp<ViewStyle>;
  colors?: Partial<ScoutColors>;
}

// ShirtScout defaults — other apps pass their own primary + secondary.
const DEFAULTS: ScoutColors = {
  primary: '#7CFF5B',
  secondary: '#B388FF',
  skin: '#F5F2FA',
  outline: '#1B0A30',
  limb: '#2A0E4A',
};

// ── Character ───────────────────────────────────────────────────────────────
//
// ViewBox 200 × 220.
// Pose: low stalking crouch — weight pushed forward, arms reaching wide,
// knees deeply bent, eyebrows furrowed in concentration.
//
export default function ScoutMascot({ size = 160, style, colors }: Props) {
  const C: ScoutColors = { ...DEFAULTS, ...colors };

  return (
    <Svg width={size} height={Math.round(size * 1.1)} viewBox="0 0 200 220" style={style}>

      {/* ── Ground shadow ─────────────────────────────────── */}
      <Ellipse cx="100" cy="214" rx="58" ry="8" fill={C.outline} opacity="0.22" />

      {/* ── Shoes (wide stance) ───────────────────────────── */}
      <Ellipse cx="72"  cy="205" rx="18" ry="9" fill={C.limb} />
      <Ellipse cx="128" cy="205" rx="18" ry="9" fill={C.limb} />

      {/* ── Legs – deep V-bend, wide crouch ───────────────── */}
      <Path d="M84,172 Q62,198 72,205"   stroke={C.limb} strokeWidth="20" strokeLinecap="round" fill="none" />
      <Path d="M116,172 Q138,198 128,205" stroke={C.limb} strokeWidth="20" strokeLinecap="round" fill="none" />

      {/* ── Shirt / body ──────────────────────────────────── */}
      <Ellipse cx="100" cy="152" rx="40" ry="25" fill={C.primary} stroke={C.outline} strokeWidth="1.5" />
      <Path
        d="M92,130 L100,142 L108,130"
        stroke={C.outline}
        strokeWidth="2"
        fill="none"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* ── Arms – reaching far forward (stalking reach) ──── */}
      <Path d="M68,142 Q42,166 40,184"   stroke={C.limb} strokeWidth="18" strokeLinecap="round" fill="none" />
      <Path d="M132,142 Q158,166 160,184" stroke={C.limb} strokeWidth="18" strokeLinecap="round" fill="none" />

      {/* ── Hands ─────────────────────────────────────────── */}
      <Circle cx="40"  cy="184" r="9" fill={C.skin} stroke={C.outline} strokeWidth="1.5" />
      <Circle cx="160" cy="184" r="9" fill={C.skin} stroke={C.outline} strokeWidth="1.5" />

      {/* ── Neck – short/hunched ──────────────────────────── */}
      <Ellipse cx="100" cy="126" rx="9" ry="6" fill={C.skin} />

      {/* ── Head – nudged forward of body centre ─────────── */}
      <Circle cx="103" cy="89" r="34" fill={C.skin} stroke={C.outline} strokeWidth="1.5" />

      {/* ── Cheeks ────────────────────────────────────────── */}
      <Ellipse cx="86"  cy="100" rx="11" ry="7" fill={C.secondary} opacity="0.38" />
      <Ellipse cx="120" cy="100" rx="11" ry="7" fill={C.secondary} opacity="0.38" />

      {/* ── Eyes – pupils pushed right (peering at prey) ──── */}
      <Circle cx="90"  cy="84" r="10" fill="white" stroke={C.outline} strokeWidth="1.5" />
      <Circle cx="116" cy="84" r="10" fill="white" stroke={C.outline} strokeWidth="1.5" />
      <Circle cx="93"  cy="85" r="6"  fill={C.outline} />
      <Circle cx="119" cy="85" r="6"  fill={C.outline} />
      <Circle cx="95"  cy="82" r="2.5" fill="white" />
      <Circle cx="121" cy="82" r="2.5" fill="white" />

      {/* ── Eyebrows – furrowed V: inner corners pulled down  */}
      {/* creating the concentrated "locked on target" look   */}
      <Path d="M83,71 Q89,67 95,74"   stroke={C.outline} strokeWidth="3" strokeLinecap="round" fill="none" />
      <Path d="M111,74 Q117,67 123,71" stroke={C.outline} strokeWidth="3" strokeLinecap="round" fill="none" />

      {/* ── Mouth – small determined smile, not a grin ────── */}
      <Path d="M94,107 Q103,113 112,107" stroke={C.outline} strokeWidth="3" strokeLinecap="round" fill="none" />

      {/* ── Hat brim ──────────────────────────────────────── */}
      <Ellipse cx="103" cy="59" rx="41" ry="9" fill={C.secondary} stroke={C.outline} strokeWidth="1.5" />

      {/* ── Hat dome ──────────────────────────────────────── */}
      <Path
        d="M66,59 Q66,23 103,21 Q140,23 140,59 Z"
        fill={C.secondary}
        stroke={C.outline}
        strokeWidth="1.5"
      />

      {/* ── Hat badge – magnifying glass (scouting/search) ── */}
      <Circle cx="103" cy="43" r="10" fill={C.primary} stroke={C.outline} strokeWidth="1.5" />
      <Circle cx="102" cy="41" r="4"  fill="none" stroke={C.outline} strokeWidth="1.5" />
      <Path d="M105,44 L109,48" stroke={C.outline} strokeWidth="1.5" strokeLinecap="round" fill="none" />

      {/* ── Concentration marks – subtle intensity lines ───── */}
      <Path d="M61,84 L67,83" stroke={C.secondary} strokeWidth="2" strokeLinecap="round" opacity="0.55" />
      <Path d="M63,94 L69,91" stroke={C.secondary} strokeWidth="2" strokeLinecap="round" opacity="0.40" />
      <Path d="M145,84 L139,83" stroke={C.secondary} strokeWidth="2" strokeLinecap="round" opacity="0.55" />
      <Path d="M143,94 L137,91" stroke={C.secondary} strokeWidth="2" strokeLinecap="round" opacity="0.40" />

    </Svg>
  );
}
