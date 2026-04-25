import React from 'react';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';
import { StyleProp, ViewStyle } from 'react-native';

// ── Cross-app color system ───────────────────────────────────────────────────
//
// The Scout mark is shared across the Scout app family.
// Override just two slots to re-skin it for any product:
//
//   <ScoutMascot colors={{ primary: '#FF6B35', secondary: '#4ECDC4' }} />
//
interface ScoutColors {
  primary: string;    // active chrome: scan arcs, handle, hat badge
  secondary: string;  // structure: lens ring, hat body
}

interface Props {
  size?: number;
  style?: StyleProp<ViewStyle>;
  colors?: Partial<ScoutColors>;
}

const DEFAULTS: ScoutColors = {
  primary: '#7CFF5B',
  secondary: '#B388FF',
};

// ── The Scout mark ───────────────────────────────────────────────────────────
//
// A precision magnifying glass with a right-facing radar sweep inside —
// the search metaphor made geometric. A scout hat above ties it to the
// Scout identity without any cartoon character.
//
// ViewBox 200 × 220. Lens centre (90, 102) r=62. Handle exits at 45°
// lower-right. Hat sits above lens covering the top of the ring.
//
export default function ScoutMascot({ size = 160, style, colors }: Props) {
  const C: ScoutColors = { ...DEFAULTS, ...colors };

  return (
    <Svg width={size} height={Math.round(size * 1.1)} viewBox="0 0 200 220" style={style}>

      {/* ── Lens interior ── secondary tint gives the glass depth */}
      <Circle cx="90" cy="102" r="62" fill={C.secondary} opacity="0.10" />

      {/* ── Lens rim ── the magnifying-glass ring */}
      <Circle cx="90" cy="102" r="62" fill="none" stroke={C.secondary} strokeWidth="3.5" />

      {/* ── Glass gleam ── single light-refraction arc, upper-left */}
      <Ellipse cx="68" cy="76" rx="18" ry="10" fill="white" opacity="0.07"
        transform="rotate(-30, 68, 76)" />

      {/* ── Scan arcs ── three-band right-facing radar sweep            */}
      {/* Each arc is 100° centred on the lens centre, fading outward   */}
      <Path d="M99,91 A14,14 0 0,1 99,113"  stroke={C.primary} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <Path d="M105,84 A24,24 0 0,1 105,120" stroke={C.primary} strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.70" />
      <Path d="M112,76 A34,34 0 0,1 112,128" stroke={C.primary} strokeWidth="2"   strokeLinecap="round" fill="none" opacity="0.40" />

      {/* ── Origin dot ── focal point anchoring the sweep */}
      <Circle cx="90" cy="102" r="5" fill={C.primary} />

      {/* ── Handle ── bold 14 px diagonal grip, round-capped */}
      <Path d="M134,146 L166,192" stroke={C.primary} strokeWidth="14" strokeLinecap="round" fill="none" />

      {/* ── Hat dome ── drawn after lens so it sits on top of the ring */}
      <Path d="M60,44 Q63,18 90,16 Q117,18 120,44 Z" fill={C.secondary} />

      {/* ── Hat brim ── wider than the dome, overlaps top of lens ring */}
      <Ellipse cx="90" cy="44" rx="32" ry="8" fill={C.secondary} />

      {/* ── Hat badge ── primary-colour dot on the cap front */}
      <Circle cx="90" cy="30" r="6" fill={C.primary} />

    </Svg>
  );
}
