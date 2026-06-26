export type StudioArtworkDraft = {
  id: string
  title: string
  imageUrl?: string
  status?: 'draft' | 'published'
  source?: 'studio' | 'feed'
  width?: number
  height?: number
  dpi?: number
  colorProfile?: 'sRGB' | 'CMYK'
}

export type StudioToolId =
  | 'select'
  | 'brush'
  | 'erase'
  | 'smudge'
  | 'fill'
  | 'gradient'
  | 'shape'
  | 'text'
  | 'image'
  | 'sticker'
  | 'frame'
  | 'ai'
  | 'zoom'
  | 'hand'

export type AssetTabId = 'assets' | 'brushes' | 'textures' | 'fonts' | 'patterns'

export type LayerRow = {
  id: string
  label: string
  depth: number
  active?: boolean
  folder?: boolean
  fx?: boolean
  tag?: string
  thumb?: string
}
