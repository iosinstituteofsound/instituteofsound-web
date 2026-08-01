export type NationRankTier =
  | 'voyager'
  | 'aster'
  | 'nexus'
  | 'aegis'
  | 'soulbound'
  | 'luminary'
  | 'paragon'
  | 'crownbearer'
  | 'vertex'
  | 'orisyn'

export type NationRankLevel = 'I' | 'II' | 'III' | 'IV' | 'V'

/** Lowest → highest (Voyager at index 0, Orisyn at index 9). */
export const NATION_RANK_TIERS: NationRankTier[] = [
  'voyager',
  'aster',
  'nexus',
  'aegis',
  'soulbound',
  'luminary',
  'paragon',
  'crownbearer',
  'vertex',
  'orisyn',
]

export const NATION_RANK_TIER_LABELS: Record<NationRankTier, string> = {
  voyager: 'Voyager',
  aster: 'Aster',
  nexus: 'Nexus',
  aegis: 'Aegis',
  soulbound: 'Soulbound',
  luminary: 'Luminary',
  paragon: 'Paragon',
  crownbearer: 'Crownbearer',
  vertex: 'Vertex',
  orisyn: 'Orisyn',
}

export const NATION_RANK_LEVELS: NationRankLevel[] = ['I', 'II', 'III', 'IV', 'V']

/** Highest → lowest for UI lists (Orisyn first, Voyager last). */
export const NATION_RANK_TIERS_DESC: NationRankTier[] = [...NATION_RANK_TIERS].reverse()

const LEGACY_TIER_MAP: Record<string, NationRankTier> = {
  iron: 'voyager',
  bronze: 'aster',
  silver: 'nexus',
  gold: 'aegis',
  platinum: 'soulbound',
  diamond: 'luminary',
  signal: 'orisyn',
}

export function isNationRankTier(value: string): value is NationRankTier {
  return Object.prototype.hasOwnProperty.call(NATION_RANK_TIER_LABELS, value)
}

export function normalizeNationRankTier(value: string | undefined): NationRankTier | undefined {
  if (!value) return undefined
  if (isNationRankTier(value)) return value
  return LEGACY_TIER_MAP[value]
}

export function rankMetaFromLevel(level: number) {
  const safeLevel = Math.max(1, level)
  const tierIndex = Math.min(Math.floor((safeLevel - 1) / 5), NATION_RANK_TIERS.length - 1)
  const levelIndex = (safeLevel - 1) % 5
  const tier = NATION_RANK_TIERS[tierIndex]!

  return {
    tier,
    tierLabel: NATION_RANK_TIER_LABELS[tier],
    levelLabel: NATION_RANK_LEVELS[levelIndex]!,
  }
}

export function rankMetaFromDbScore(dbScore: number) {
  const level = Math.max(1, Math.floor(dbScore / 500) + 1)
  return rankMetaFromLevel(level)
}
