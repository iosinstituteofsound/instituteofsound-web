export interface BgArtifactDesign {
  id: string
  label: string
  svg: string
  /** tile = repeating pattern, cover = stretch over full canvas */
  fit?: 'tile' | 'cover'
}

const SVG_SIZE = 120

function patternId(seed: string): string {
  return `p-${seed.replace(/[^a-z0-9-]/gi, '')}`
}

function svgDoc(body: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SVG_SIZE}" height="${SVG_SIZE}" viewBox="0 0 ${SVG_SIZE} ${SVG_SIZE}">${body}</svg>`
}

/** Repeating SVG pattern fill — body must include `<pattern id="...">` */
function tilePattern(
  id: string,
  label: string,
  body: string,
  fit: 'tile' | 'cover' = 'tile',
): BgArtifactDesign {
  return {
    id,
    label,
    fit,
    svg: svgDoc(`${body}<rect width="100%" height="100%" fill="url(#${patternId(id)})"/>`),
  }
}

/** Repeating motif — tiles the whole SVG graphic */
function motifTile(id: string, label: string, body: string): BgArtifactDesign {
  return { id, label, fit: 'tile', svg: svgDoc(body) }
}

function coverDesign(id: string, label: string, body: string): BgArtifactDesign {
  return { id, label, fit: 'cover', svg: svgDoc(body) }
}

function gridPattern(id: string, label: string, color: string, cell: number): BgArtifactDesign {
  const pid = patternId(id)
  return tilePattern(
    id,
    label,
    `<defs><pattern id="${pid}" width="${cell}" height="${cell}" patternUnits="userSpaceOnUse"><path d="M${cell} 0H0V${cell}" fill="none" stroke="${color}" stroke-width="0.65"/></pattern></defs>`,
  )
}

function dotPattern(id: string, label: string, color: string, cell: number, radius: number): BgArtifactDesign {
  const pid = patternId(id)
  return tilePattern(
    id,
    label,
    `<defs><pattern id="${pid}" width="${cell}" height="${cell}" patternUnits="userSpaceOnUse"><circle cx="${cell / 2}" cy="${cell / 2}" r="${radius}" fill="${color}"/></pattern></defs>`,
  )
}

function diagonalPattern(id: string, label: string, color: string, cell: number): BgArtifactDesign {
  const pid = patternId(id)
  return tilePattern(
    id,
    label,
    `<defs><pattern id="${pid}" width="${cell}" height="${cell}" patternUnits="userSpaceOnUse"><path d="M0 ${cell}L${cell} 0" stroke="${color}" stroke-width="0.7"/></pattern></defs>`,
  )
}

function scanlinePattern(id: string, label: string, color: string, gap: number): BgArtifactDesign {
  const pid = patternId(id)
  return tilePattern(
    id,
    label,
    `<defs><pattern id="${pid}" width="4" height="${gap}" patternUnits="userSpaceOnUse"><rect width="4" height="1" fill="${color}"/></pattern></defs>`,
  )
}

function vignette(id: string, label: string, strength: number): BgArtifactDesign {
  return coverDesign(
    id,
    label,
    `<defs><radialGradient id="${patternId(id)}" cx="50%" cy="50%" r="50%"><stop offset="50%" stop-color="rgba(0,0,0,0)"/><stop offset="100%" stop-color="rgba(0,0,0,${strength})"/></radialGradient></defs><rect width="100%" height="100%" fill="url(#${patternId(id)})"/>`,
  )
}

function radialGlow(id: string, label: string, color: string, cx: string, cy: string): BgArtifactDesign {
  return coverDesign(
    id,
    label,
    `<defs><radialGradient id="${patternId(id)}" cx="${cx}" cy="${cy}" r="55%"><stop offset="0%" stop-color="${color}"/><stop offset="100%" stop-color="rgba(0,0,0,0)"/></radialGradient></defs><rect width="100%" height="100%" fill="url(#${patternId(id)})"/>`,
  )
}

const SCIFI_COLORS = [
  'rgba(56,189,248,0.45)',
  'rgba(34,211,238,0.4)',
  'rgba(45,212,191,0.38)',
  'rgba(125,211,252,0.35)',
  'rgba(96,165,250,0.42)',
]

export function generateScifiDesigns(): BgArtifactDesign[] {
  return [
    gridPattern('scifi-grid-fine', 'Fine grid', SCIFI_COLORS[0]!, 16),
    gridPattern('scifi-grid-wide', 'Wide grid', SCIFI_COLORS[1]!, 28),
    dotPattern('scifi-dots-small', 'Micro dots', SCIFI_COLORS[2]!, 10, 1),
    dotPattern('scifi-dots-large', 'Large dots', SCIFI_COLORS[3]!, 18, 2.2),
    diagonalPattern('scifi-diagonal', 'Diagonal mesh', SCIFI_COLORS[4]!, 14),
    scanlinePattern('scifi-scan-tight', 'Tight scan', SCIFI_COLORS[0]!, 3),
    scanlinePattern('scifi-scan-wide', 'Wide scan', SCIFI_COLORS[1]!, 6),
    tilePattern(
      'scifi-circuit',
      'Circuit board',
      `<defs><pattern id="${patternId('scifi-circuit')}" width="36" height="36" patternUnits="userSpaceOnUse"><path d="M0 18h10m16 0h10M18 0v10m0 16v10" stroke="${SCIFI_COLORS[2]}" stroke-width="0.75" fill="none"/><circle cx="18" cy="18" r="1.8" fill="${SCIFI_COLORS[0]}"/></pattern></defs>`,
    ),
    tilePattern(
      'scifi-hex',
      'Hex grid',
      `<defs><pattern id="${patternId('scifi-hex')}" width="28" height="24" patternUnits="userSpaceOnUse"><path d="M14 2l11 6.5v11L14 26l-11-6.5v-11z" fill="none" stroke="${SCIFI_COLORS[3]}" stroke-width="0.75"/></pattern></defs>`,
    ),
    coverDesign(
      'scifi-hud',
      'HUD frame',
      `<path d="M8 28V8h22M90 8h22v20M8 90v22h22M90 112h22V90" fill="none" stroke="${SCIFI_COLORS[0]}" stroke-width="1.1"/><circle cx="60" cy="60" r="20" fill="none" stroke="${SCIFI_COLORS[1]}" stroke-width="0.7"/>`,
    ),
    coverDesign(
      'scifi-crosshair',
      'Crosshair',
      `<circle cx="60" cy="60" r="26" fill="none" stroke="${SCIFI_COLORS[4]}" stroke-width="0.75"/><path d="M60 18v20M60 82v20M18 60h20M82 60h20" stroke="${SCIFI_COLORS[0]}" stroke-width="0.8"/>`,
    ),
    coverDesign(
      'scifi-radar',
      'Radar sweep',
      `<circle cx="60" cy="60" r="40" fill="none" stroke="${SCIFI_COLORS[2]}" stroke-width="0.5"/><path d="M60 60L100 40" stroke="${SCIFI_COLORS[0]}" stroke-width="0.9"/><circle cx="60" cy="60" r="4" fill="${SCIFI_COLORS[1]}"/>`,
    ),
    tilePattern(
      'scifi-binary',
      'Data bits',
      `<defs><pattern id="${patternId('scifi-binary')}" width="14" height="14" patternUnits="userSpaceOnUse"><rect x="2" y="2" width="4" height="4" fill="${SCIFI_COLORS[4]}"/><rect x="9" y="9" width="3" height="3" fill="${SCIFI_COLORS[1]}"/></pattern></defs>`,
    ),
    tilePattern(
      'scifi-pulse',
      'Pulse lines',
      `<defs><pattern id="${patternId('scifi-pulse')}" width="24" height="8" patternUnits="userSpaceOnUse"><path d="M0 4h6l2-3 2 6 2-4 2 2h8" stroke="${SCIFI_COLORS[0]}" stroke-width="0.7" fill="none"/></pattern></defs>`,
    ),
    coverDesign(
      'scifi-stars',
      'Starfield',
      `<circle cx="14" cy="20" r="1" fill="rgba(255,255,255,0.65)"/><circle cx="38" cy="12" r="0.6" fill="rgba(255,255,255,0.45)"/><circle cx="62" cy="26" r="1.1" fill="rgba(255,255,255,0.7)"/><circle cx="92" cy="18" r="0.8" fill="rgba(255,255,255,0.55)"/><circle cx="22" cy="58" r="0.7" fill="rgba(255,255,255,0.5)"/><circle cx="78" cy="72" r="0.9" fill="rgba(255,255,255,0.6)"/><circle cx="48" cy="96" r="0.65" fill="rgba(255,255,255,0.48)"/><circle cx="106" cy="44" r="0.55" fill="rgba(255,255,255,0.42)"/><circle cx="8" cy="98" r="0.75" fill="rgba(255,255,255,0.52)"/><circle cx="100" cy="100" r="0.85" fill="rgba(255,255,255,0.58)"/>`,
    ),
    radialGlow('scifi-glow-blue', 'Blue glow', 'rgba(56,189,248,0.28)', '30%', '25%'),
    radialGlow('scifi-glow-teal', 'Teal glow', 'rgba(45,212,191,0.25)', '75%', '70%'),
    gridPattern('scifi-matrix', 'Matrix grid', SCIFI_COLORS[2]!, 20),
    dotPattern('scifi-nodes', 'Node field', SCIFI_COLORS[0]!, 22, 1.4),
    coverDesign(
      'scifi-brackets',
      'Tech brackets',
      `<path d="M12 30V12h16M92 12v18M12 90v18h16M92 108V90" fill="none" stroke="${SCIFI_COLORS[3]}" stroke-width="1"/><path d="M48 60h24" stroke="${SCIFI_COLORS[0]}" stroke-width="0.8"/>`,
    ),
  ]
}

const ROCK_COLORS = [
  'rgba(239,68,68,0.45)',
  'rgba(250,204,21,0.48)',
  'rgba(255,255,255,0.28)',
  'rgba(248,113,113,0.4)',
  'rgba(251,146,60,0.38)',
]

export function generateRockDesigns(): BgArtifactDesign[] {
  return [
    dotPattern('rock-grille-tight', 'Tight grille', ROCK_COLORS[0]!, 7, 1.3),
    dotPattern('rock-grille-wide', 'Wide grille', ROCK_COLORS[1]!, 11, 1.8),
    diagonalPattern('rock-slash', 'Slash marks', ROCK_COLORS[2]!, 18),
    gridPattern('rock-metal', 'Metal grid', ROCK_COLORS[3]!, 22),
    coverDesign(
      'rock-lightning',
      'Lightning',
      `<path d="M68 8L42 58h18L52 112l38-54H72z" fill="none" stroke="${ROCK_COLORS[1]}" stroke-width="1.3" stroke-linejoin="round"/>`,
    ),
    coverDesign(
      'rock-vinyl',
      'Vinyl record',
      `<circle cx="60" cy="60" r="46" fill="none" stroke="${ROCK_COLORS[2]}" stroke-width="0.55"/><circle cx="60" cy="60" r="32" fill="none" stroke="${ROCK_COLORS[2]}" stroke-width="0.45"/><circle cx="60" cy="60" r="6" fill="${ROCK_COLORS[0]}"/>`,
    ),
    coverDesign(
      'rock-distress-1',
      'Distress A',
      `<path d="M0 38c22-8 36 8 58-2s32-12 62 6M0 76c20 6 44-4 64 2s30 10 56-4" fill="none" stroke="${ROCK_COLORS[2]}" stroke-width="1.1"/>`,
    ),
    coverDesign(
      'rock-distress-2',
      'Distress B',
      `<path d="M8 96l28-72M44 108l22-64M78 98l18-52" stroke="${ROCK_COLORS[2]}" stroke-width="0.75" fill="none"/>`,
    ),
    motifTile(
      'rock-splatter',
      'Grunge splatter',
      `<circle cx="26" cy="32" r="9" fill="${ROCK_COLORS[2]}"/><circle cx="84" cy="26" r="12" fill="rgba(255,255,255,0.1)"/><circle cx="62" cy="74" r="15" fill="rgba(255,255,255,0.12)"/><circle cx="18" cy="88" r="7" fill="${ROCK_COLORS[4]}"/>`,
    ),
    scanlinePattern('rock-amp-hum', 'Amp hum', ROCK_COLORS[0]!, 5),
    tilePattern(
      'rock-zigzag',
      'Zigzag',
      `<defs><pattern id="${patternId('rock-zigzag')}" width="20" height="10" patternUnits="userSpaceOnUse"><path d="M0 5l5-4 5 4-5 4z" fill="none" stroke="${ROCK_COLORS[1]}" stroke-width="0.65"/></pattern></defs>`,
    ),
    coverDesign(
      'rock-skull-frame',
      'Skull frame',
      `<ellipse cx="60" cy="52" rx="18" ry="22" fill="none" stroke="${ROCK_COLORS[0]}" stroke-width="0.9"/><circle cx="50" cy="48" r="3" fill="${ROCK_COLORS[2]}"/><circle cx="70" cy="48" r="3" fill="${ROCK_COLORS[2]}"/>`,
    ),
    radialGlow('rock-spot-red', 'Red spotlight', 'rgba(239,68,68,0.22)', '50%', '15%'),
    radialGlow('rock-spot-amber', 'Amber spotlight', 'rgba(250,204,21,0.2)', '80%', '80%'),
    dotPattern('rock-speckle', 'Speckle', ROCK_COLORS[4]!, 9, 0.9),
    gridPattern('rock-barrier', 'Barrier grid', ROCK_COLORS[3]!, 26),
    coverDesign(
      'rock-bolt',
      'Bolt strike',
      `<path d="M52 10L38 58h14l-8 52 32-48H64z" fill="none" stroke="${ROCK_COLORS[1]}" stroke-width="1.1"/>`,
    ),
    diagonalPattern('rock-scratch', 'Scratches', ROCK_COLORS[2]!, 12),
    coverDesign(
      'rock-flames',
      'Flame hints',
      `<path d="M10 110c8-24 16-10 24-26s12 16 20-8 10 24 18 10 16-12 28 4" fill="none" stroke="${ROCK_COLORS[4]}" stroke-width="1.1"/><path d="M0 120c12-8 20 6 34-4" fill="none" stroke="${ROCK_COLORS[1]}" stroke-width="0.8" opacity="0.7"/>`,
    ),
    coverDesign(
      'rock-crowd',
      'Crowd noise',
      `<path d="M0 90c15-6 25 4 40-2s30-8 50 2 20 6 30-4" fill="none" stroke="${ROCK_COLORS[2]}" stroke-width="0.9"/>`,
    ),
  ]
}

const CINE_COLORS = [
  'rgba(0,0,0,0.55)',
  'rgba(255,255,255,0.22)',
  'rgba(251,191,36,0.38)',
  'rgba(255,255,255,0.28)',
]

export function generateCinematicDesigns(): BgArtifactDesign[] {
  return [
    vignette('cine-vignette-soft', 'Soft vignette', 0.45),
    vignette('cine-vignette-hard', 'Hard vignette', 0.65),
    coverDesign('cine-letterbox', 'Letterbox', `<rect y="0" width="120" height="16" fill="${CINE_COLORS[0]}"/><rect y="104" width="120" height="16" fill="${CINE_COLORS[0]}"/>`),
    scanlinePattern('cine-grain-fine', 'Fine grain', CINE_COLORS[1]!, 4),
    scanlinePattern('cine-grain-coarse', 'Coarse grain', CINE_COLORS[1]!, 7),
    radialGlow('cine-leak-gold', 'Gold leak', CINE_COLORS[2]!, '88%', '12%'),
    radialGlow('cine-leak-warm', 'Warm leak', 'rgba(251,113,133,0.25)', '15%', '85%'),
    radialGlow('cine-spot-top', 'Top spotlight', CINE_COLORS[3]!, '50%', '12%'),
    radialGlow('cine-spot-side', 'Side spotlight', CINE_COLORS[3]!, '90%', '50%'),
    coverDesign(
      'cine-flare',
      'Lens flare',
      `<circle cx="86" cy="30" r="14" fill="rgba(255,255,255,0.18)"/><circle cx="72" cy="46" r="6" fill="rgba(255,255,255,0.12)"/>`,
    ),
    coverDesign(
      'cine-scope',
      'Scope frame',
      `<rect x="8" y="8" width="104" height="104" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="0.8"/>`,
    ),
    motifTile(
      'cine-dust',
      'Film dust',
      `<circle cx="18" cy="24" r="0.9" fill="${CINE_COLORS[1]}"/><circle cx="52" cy="68" r="0.7" fill="${CINE_COLORS[1]}"/><circle cx="88" cy="40" r="1" fill="${CINE_COLORS[1]}"/><circle cx="34" cy="96" r="0.6" fill="${CINE_COLORS[1]}"/><circle cx="102" cy="82" r="0.8" fill="${CINE_COLORS[1]}"/>`,
    ),
    diagonalPattern('cine-streak', 'Light streak', 'rgba(255,255,255,0.08)', 40),
    coverDesign(
      'cine-countdown',
      'Countdown circle',
      `<circle cx="60" cy="60" r="28" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="0.8"/><text x="60" y="66" text-anchor="middle" fill="rgba(255,255,255,0.25)" font-size="14" font-family="sans-serif">3</text>`,
    ),
    gridPattern('cine-reel', 'Reel marks', 'rgba(255,255,255,0.1)', 30),
    coverDesign(
      'cine-bars-thin',
      'Thin bars',
      `<rect y="0" width="120" height="10" fill="${CINE_COLORS[0]}"/><rect y="110" width="120" height="10" fill="${CINE_COLORS[0]}"/>`,
    ),
    coverDesign(
      'cine-bars-thick',
      'Thick bars',
      `<rect y="0" width="120" height="22" fill="${CINE_COLORS[0]}"/><rect y="98" width="120" height="22" fill="${CINE_COLORS[0]}"/>`,
    ),
    radialGlow('cine-haze', 'Soft haze', 'rgba(255,255,255,0.12)', '50%', '50%'),
    dotPattern('cine-bokeh', 'Bokeh dots', 'rgba(255,255,255,0.15)', 24, 2.5),
    coverDesign(
      'cine-shutter',
      'Shutter slice',
      `<path d="M0 0h120v24H0zM0 48h120v24H0zM0 96h120v24H0z" fill="rgba(0,0,0,0.12)"/>`,
    ),
  ]
}

const GOTHIC_COLORS = [
  'rgba(168,85,247,0.4)',
  'rgba(139,92,246,0.32)',
  'rgba(88,28,135,0.28)',
  'rgba(196,181,253,0.25)',
]

export function generateGothicDesigns(): BgArtifactDesign[] {
  return [
    coverDesign(
      'gothic-corners',
      'Ornate corners',
      `<path d="M6 34V6h28M86 6h28v28M6 86v28h28M86 114h28V86" fill="none" stroke="${GOTHIC_COLORS[0]}" stroke-width="1.1"/>`,
    ),
    coverDesign(
      'gothic-rose',
      'Rose window',
      `<circle cx="60" cy="60" r="28" fill="none" stroke="${GOTHIC_COLORS[1]}" stroke-width="0.75"/><path d="M60 32v56M32 60h56M44 44l32 32M76 44L44 76" stroke="${GOTHIC_COLORS[2]}" stroke-width="0.55"/>`,
    ),
    motifTile(
      'gothic-crosses',
      'Cross pattern',
      `<path d="M18 14v6h-3v3h3v6h3v-6h3v-3h-3v-6z" fill="${GOTHIC_COLORS[0]}"/><path d="M90 88v5h-2.5v2.5H90v5h2.5v-5H95v-2.5h-2.5v-5z" fill="${GOTHIC_COLORS[0]}"/><path d="M54 54v4h-2v2h2v4h2v-4h2v-2h-2v-4z" fill="${GOTHIC_COLORS[1]}"/>`,
    ),
    coverDesign(
      'gothic-arches',
      'Arches',
      `<path d="M10 100V62a18 18 0 0118-18h16M76 44a18 18 0 0118 18v38" fill="none" stroke="${GOTHIC_COLORS[1]}" stroke-width="0.85"/>`,
    ),
    tilePattern(
      'gothic-chains',
      'Chain links',
      `<defs><pattern id="${patternId('gothic-chains')}" width="14" height="10" patternUnits="userSpaceOnUse"><ellipse cx="7" cy="5" rx="5" ry="3" fill="none" stroke="${GOTHIC_COLORS[2]}" stroke-width="0.65"/></pattern></defs>`,
    ),
    coverDesign(
      'gothic-mist',
      'Dark mist',
      `<ellipse cx="40" cy="90" rx="36" ry="14" fill="${GOTHIC_COLORS[2]}"/><ellipse cx="88" cy="96" rx="28" ry="10" fill="rgba(88,28,135,0.16)"/>`,
    ),
    gridPattern('gothic-lattice', 'Stone lattice', GOTHIC_COLORS[3]!, 24),
    dotPattern('gothic-stars', 'Occult stars', GOTHIC_COLORS[0]!, 28, 1.2),
    coverDesign(
      'gothic-crypt',
      'Crypt frame',
      `<path d="M30 100V70a14 14 0 0128 0v30" fill="none" stroke="${GOTHIC_COLORS[1]}" stroke-width="0.9"/>`,
    ),
    diagonalPattern('gothic-web', 'Spider web', GOTHIC_COLORS[2]!, 20),
    radialGlow('gothic-moon', 'Moon glow', 'rgba(196,181,253,0.2)', '75%', '20%'),
    motifTile(
      'gothic-runes',
      'Rune marks',
      `<path d="M8 8v8M12 8v6M16 8v8M24 24h6M27 20v8M64 12v10M70 12v6M76 16v8M92 72h8M96 68v10" stroke="${GOTHIC_COLORS[3]}" stroke-width="0.75"/>`,
    ),
    coverDesign(
      'gothic-gargoyle',
      'Gargoyle shadow',
      `<path d="M20 100c8-20 16-8 24-16s12-4 20-12 12 8 16 4" fill="none" stroke="${GOTHIC_COLORS[2]}" stroke-width="0.8"/>`,
    ),
    scanlinePattern('gothic-veil', 'Dark veil', GOTHIC_COLORS[2]!, 5),
    coverDesign(
      'gothic-candles',
      'Candle glow',
      `<circle cx="30" cy="80" r="8" fill="rgba(251,191,36,0.12)"/><circle cx="90" cy="70" r="10" fill="rgba(251,191,36,0.1)"/>`,
    ),
    gridPattern('gothic-tiles', 'Cathedral tiles', GOTHIC_COLORS[1]!, 18),
    coverDesign(
      'gothic-portal',
      'Portal arch',
      `<path d="M40 100V58a20 20 0 0140 0v42" fill="none" stroke="${GOTHIC_COLORS[0]}" stroke-width="1"/>`,
    ),
    dotPattern('gothic-dust', 'Ash dust', GOTHIC_COLORS[3]!, 12, 0.7),
    coverDesign(
      'gothic-spire',
      'Spire lines',
      `<path d="M60 10L48 100M60 10L72 100" stroke="${GOTHIC_COLORS[1]}" stroke-width="0.7"/>`,
    ),
    vignette('gothic-vignette', 'Gothic vignette', 0.5),
  ]
}

const NEON_COLORS = [
  'rgba(236,72,153,0.38)',
  'rgba(59,130,246,0.34)',
  'rgba(250,204,21,0.32)',
  'rgba(34,211,238,0.35)',
  'rgba(167,139,250,0.33)',
]

export function generateNeonDesigns(): BgArtifactDesign[] {
  return [
    gridPattern('neon-grid-pink', 'Pink grid', NEON_COLORS[0]!, 18),
    gridPattern('neon-grid-blue', 'Blue grid', NEON_COLORS[1]!, 20),
    coverDesign(
      'neon-lines',
      'Glow lines',
      `<path d="M0 30h120M0 60h120M0 90h120" stroke="${NEON_COLORS[0]}" stroke-width="0.75"/><path d="M30 0v120M60 0v120M90 0v120" stroke="${NEON_COLORS[1]}" stroke-width="0.75"/>`,
    ),
    coverDesign(
      'neon-rings',
      'Pulse rings',
      `<circle cx="60" cy="60" r="16" fill="none" stroke="${NEON_COLORS[0]}" stroke-width="0.75"/><circle cx="60" cy="60" r="30" fill="none" stroke="${NEON_COLORS[1]}" stroke-width="0.65"/><circle cx="60" cy="60" r="44" fill="none" stroke="${NEON_COLORS[0]}" stroke-width="0.5"/>`,
    ),
    coverDesign(
      'neon-laser',
      'Laser beams',
      `<path d="M0 100L120 20" stroke="${NEON_COLORS[0]}" stroke-width="1.1"/><path d="M0 80L120 40" stroke="${NEON_COLORS[1]}" stroke-width="0.75"/>`,
    ),
    dotPattern('neon-city', 'City lights', NEON_COLORS[2]!, 16, 1.1),
    coverDesign(
      'neon-wave',
      'Retro wave',
      `<path d="M0 82c20-10 40 10 60 0s40-10 60 0" fill="none" stroke="${NEON_COLORS[0]}" stroke-width="0.95"/><path d="M0 98c20-10 40 10 60 0s40-10 60 0" fill="none" stroke="${NEON_COLORS[1]}" stroke-width="0.75"/>`,
    ),
    diagonalPattern('neon-synth', 'Synth diagonal', NEON_COLORS[3]!, 16),
    scanlinePattern('neon-scan', 'Neon scan', NEON_COLORS[0]!, 4),
    radialGlow('neon-bloom-pink', 'Pink bloom', 'rgba(236,72,153,0.25)', '25%', '30%'),
    radialGlow('neon-bloom-blue', 'Blue bloom', 'rgba(59,130,246,0.22)', '78%', '65%'),
    tilePattern(
      'neon-triangle',
      'Neon triangles',
      `<defs><pattern id="${patternId('neon-triangle')}" width="22" height="20" patternUnits="userSpaceOnUse"><path d="M11 2l9 16H2z" fill="none" stroke="${NEON_COLORS[4]}" stroke-width="0.6"/></pattern></defs>`,
    ),
    coverDesign(
      'neon-sign',
      'Neon sign',
      `<rect x="20" y="40" width="80" height="36" rx="4" fill="none" stroke="${NEON_COLORS[0]}" stroke-width="1"/><path d="M32 58h56" stroke="${NEON_COLORS[1]}" stroke-width="0.8"/>`,
    ),
    dotPattern('neon-spark', 'Sparks', NEON_COLORS[2]!, 14, 0.8),
    gridPattern('neon-miami', 'Miami grid', NEON_COLORS[3]!, 24),
    coverDesign(
      'neon-horizon',
      'Neon horizon',
      `<path d="M0 72h120" stroke="${NEON_COLORS[0]}" stroke-width="1.2"/><path d="M0 88c20 8 40-8 60 0s40 8 60 0" fill="none" stroke="${NEON_COLORS[1]}" stroke-width="0.8"/>`,
    ),
    coverDesign(
      'neon-burst',
      'Star burst',
      `<path d="M60 20v80M20 60h80M32 32l56 56M88 32L32 88" stroke="${NEON_COLORS[4]}" stroke-width="0.65"/>`,
    ),
    diagonalPattern('neon-rain', 'Neon rain', NEON_COLORS[0]!, 10),
    radialGlow('neon-club', 'Club glow', 'rgba(167,139,250,0.24)', '50%', '85%'),
    gridPattern('neon-cyber', 'Cyber mesh', NEON_COLORS[1]!, 14),
  ]
}

const VINTAGE_COLORS = [
  'rgba(120,53,15,0.32)',
  'rgba(180,83,9,0.26)',
  'rgba(92,64,51,0.3)',
  'rgba(146,64,14,0.24)',
]

export function generateVintageDesigns(): BgArtifactDesign[] {
  return [
    dotPattern('vintage-paper', 'Paper grain', VINTAGE_COLORS[0]!, 8, 0.45),
    dotPattern('vintage-halftone', 'Halftone', VINTAGE_COLORS[1]!, 10, 2),
    coverDesign(
      'vintage-sepia',
      'Sepia wash',
      `<circle cx="32" cy="42" r="20" fill="${VINTAGE_COLORS[1]}"/><circle cx="88" cy="74" r="24" fill="${VINTAGE_COLORS[0]}"/>`,
    ),
    coverDesign(
      'vintage-stamp',
      'Stamp border',
      `<rect x="12" y="12" width="96" height="96" fill="none" stroke="${VINTAGE_COLORS[2]}" stroke-width="1.1" stroke-dasharray="4 3"/>`,
    ),
    coverDesign(
      'vintage-scratches',
      'Aged scratches',
      `<path d="M8 95l35-70M55 105l20-60M85 100l18-50" stroke="${VINTAGE_COLORS[2]}" stroke-width="0.65" fill="none"/>`,
    ),
    dotPattern('vintage-dust', 'Dust specks', VINTAGE_COLORS[3]!, 11, 0.65),
    scanlinePattern('vintage-film', 'Old film', VINTAGE_COLORS[0]!, 5),
    gridPattern('vintage-weave', 'Fabric weave', VINTAGE_COLORS[2]!, 16),
    vignette('vintage-vignette', 'Vintage vignette', 0.4),
    radialGlow('vintage-fade', 'Corner fade', 'rgba(120,53,15,0.2)', '15%', '15%'),
    coverDesign(
      'vintage-postcard',
      'Postcard',
      `<rect x="10" y="14" width="100" height="92" fill="none" stroke="${VINTAGE_COLORS[2]}" stroke-width="1"/><rect x="16" y="20" width="88" height="64" fill="rgba(120,53,15,0.06)"/><path d="M16 92h88" stroke="${VINTAGE_COLORS[1]}" stroke-width="0.6" stroke-dasharray="3 2"/>`,
    ),
    diagonalPattern('vintage-worn', 'Worn lines', VINTAGE_COLORS[1]!, 22),
    coverDesign(
      'vintage-polaroid',
      'Polaroid frame',
      `<rect x="24" y="18" width="72" height="84" fill="none" stroke="${VINTAGE_COLORS[2]}" stroke-width="0.9"/><rect x="30" y="24" width="60" height="60" fill="rgba(120,53,15,0.08)"/>`,
    ),
    dotPattern('vintage-speckle', 'Ink speckle', VINTAGE_COLORS[0]!, 13, 0.55),
    coverDesign(
      'vintage-ticket',
      'Ticket stub',
      `<rect x="22" y="44" width="76" height="32" rx="3" fill="none" stroke="${VINTAGE_COLORS[3]}" stroke-width="0.8"/><path d="M22 60h76" stroke="${VINTAGE_COLORS[3]}" stroke-width="0.5" stroke-dasharray="3 2"/>`,
    ),
    gridPattern('vintage-linen', 'Linen', VINTAGE_COLORS[1]!, 20),
    coverDesign(
      'vintage-burn',
      'Burned edge',
      `<path d="M0 0c20 30 10 50 0 80s-5 30 0 40h120V0z" fill="rgba(92,64,51,0.15)"/>`,
    ),
    scanlinePattern('vintage-static', 'Static', VINTAGE_COLORS[0]!, 3),
    radialGlow('vintage-glow', 'Warm glow', 'rgba(180,83,9,0.15)', '85%', '75%'),
    coverDesign(
      'vintage-fold',
      'Paper fold',
      `<path d="M0 0l120 120M0 120L120 0" stroke="${VINTAGE_COLORS[2]}" stroke-width="0.35" opacity="0.6"/>`,
    ),
  ]
}

export function assertDesignCount(designs: BgArtifactDesign[], category: string, expected = 20): void {
  if (designs.length !== expected) {
    throw new Error(`Expected ${expected} designs for ${category}, got ${designs.length}`)
  }
}
