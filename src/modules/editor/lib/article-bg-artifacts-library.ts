import type { LucideIcon } from 'lucide-react'
import {
  Clapperboard,
  Cpu,
  Film,
  Ghost,
  Guitar,
  Zap,
} from 'lucide-react'
import {
  assertDesignCount,
  generateCinematicDesigns,
  generateGothicDesigns,
  generateNeonDesigns,
  generateRockDesigns,
  generateScifiDesigns,
  generateVintageDesigns,
  type BgArtifactDesign,
} from '@/modules/editor/lib/article-bg-artifacts-generator'

export type { BgArtifactDesign }

export interface BgArtifactCategory {
  id: string
  label: string
  icon: LucideIcon
  designs: BgArtifactDesign[]
}

const SCIFI_DESIGNS = generateScifiDesigns()
const ROCK_DESIGNS = generateRockDesigns()
const CINEMATIC_DESIGNS = generateCinematicDesigns()
const GOTHIC_DESIGNS = generateGothicDesigns()
const NEON_DESIGNS = generateNeonDesigns()
const VINTAGE_DESIGNS = generateVintageDesigns()

assertDesignCount(SCIFI_DESIGNS, 'scifi')
assertDesignCount(ROCK_DESIGNS, 'rock')
assertDesignCount(CINEMATIC_DESIGNS, 'cinematic')
assertDesignCount(GOTHIC_DESIGNS, 'gothic')
assertDesignCount(NEON_DESIGNS, 'neon')
assertDesignCount(VINTAGE_DESIGNS, 'vintage')

function svgDataUri(svg: string): string {
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}

export function artifactDesignToBackgroundImage(svg: string): string {
  return svgDataUri(svg)
}

export const BG_ARTIFACT_CATEGORIES: BgArtifactCategory[] = [
  { id: 'scifi', label: 'Sci-Fi', icon: Cpu, designs: SCIFI_DESIGNS },
  { id: 'rock', label: 'Rock', icon: Guitar, designs: ROCK_DESIGNS },
  { id: 'cinematic', label: 'Cinematic', icon: Clapperboard, designs: CINEMATIC_DESIGNS },
  { id: 'gothic', label: 'Gothic', icon: Ghost, designs: GOTHIC_DESIGNS },
  { id: 'neon', label: 'Neon', icon: Zap, designs: NEON_DESIGNS },
  { id: 'vintage', label: 'Vintage', icon: Film, designs: VINTAGE_DESIGNS },
]

export function findArtifactCategory(categoryId: string): BgArtifactCategory | undefined {
  return BG_ARTIFACT_CATEGORIES.find((category) => category.id === categoryId)
}

export function findArtifactDesign(categoryId: string, designId: string): BgArtifactDesign | undefined {
  const category = findArtifactCategory(categoryId)
  return category?.designs.find((design) => design.id === designId)
}

export function getDefaultArtifactCategoryId(): string {
  return BG_ARTIFACT_CATEGORIES[0]?.id ?? 'scifi'
}

export function getDefaultArtifactDesignId(categoryId: string): string {
  return findArtifactCategory(categoryId)?.designs[0]?.id ?? ''
}

export const BG_ARTIFACT_DESIGNS_PER_CATEGORY = 20
