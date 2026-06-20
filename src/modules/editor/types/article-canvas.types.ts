import type { ArticlePuckComponents } from '@/modules/editor/lib/article-puck-config'

export type CanvasBlockType = keyof ArticlePuckComponents

export type TextFillType = 'solid' | 'pattern' | 'gradient' | 'radial'

export type BlendMode =
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'soft-light'
  | 'hard-light'

export interface CanvasBlockEffects {
  outline: boolean
  dropShadow: boolean
  innerGlow: boolean
  emboss: boolean
  transform: boolean
  longShadow: boolean
  outerGlow: boolean
  innerShadow: boolean
  overlaysMasks: boolean
}

export interface CanvasBlockLayout {
  x: number
  y: number
  width: number
  zIndex?: number
  /** hug = box wraps text; fixed = user resized width */
  sizing?: 'hug' | 'fixed'
  /** flow = article stack; free = positioned overlay in live workspace */
  placement?: 'flow' | 'free'
  /** Layer panel visibility — hidden blocks are not shown on canvas */
  hidden?: boolean
}

export type ImageShapeType = 'rectangle' | 'circle' | 'ellipse'

export interface CanvasBlockStyle {
  fontFamilyId: string
  fontSize: number
  colorToken: string
  opacity: number
  fontWeight: 'normal' | 'bold'
  fontStyle: 'normal' | 'italic'
  textDecoration: 'none' | 'underline' | 'line-through' | 'underline line-through'
  textAlign: 'left' | 'center' | 'right' | 'justify'
  fillType: TextFillType
  preserveAspectRatio: boolean
  antiAlias: boolean
  backgroundEnabled: boolean
  fillEnabled: boolean
  colorEnabled: boolean
  masksEnabled: boolean
  backgroundColorToken: string
  imageColorToken: string
  angle: number
  blendMode: BlendMode
  scale: number
  imageShape: ImageShapeType
  roundness: number
  letterSpacing: number
  lineSpacing: number
  effects: CanvasBlockEffects
  text2dPresetId: string
  text2dIntensity: number
  text3dPresetId: string
  text3dIntensity: number
}

export const DEFAULT_CANVAS_BLOCK_EFFECTS: CanvasBlockEffects = {
  outline: false,
  dropShadow: false,
  innerGlow: false,
  emboss: false,
  transform: false,
  longShadow: false,
  outerGlow: false,
  innerShadow: false,
  overlaysMasks: false,
}

export const DEFAULT_CANVAS_BLOCK_STYLE: CanvasBlockStyle = {
  fontFamilyId: 'editorial-serif',
  fontSize: 18,
  colorToken: 'foreground',
  opacity: 100,
  fontWeight: 'normal',
  fontStyle: 'normal',
  textDecoration: 'none',
  textAlign: 'left',
  fillType: 'solid',
  preserveAspectRatio: true,
  antiAlias: true,
  backgroundEnabled: false,
  fillEnabled: false,
  colorEnabled: false,
  masksEnabled: false,
  backgroundColorToken: 'card',
  imageColorToken: 'primary',
  angle: 0,
  blendMode: 'normal',
  scale: 100,
  imageShape: 'rectangle',
  roundness: 20,
  letterSpacing: 0,
  lineSpacing: 0,
  effects: { ...DEFAULT_CANVAS_BLOCK_EFFECTS },
  text2dPresetId: '',
  text2dIntensity: 100,
  text3dPresetId: '',
  text3dIntensity: 100,
}

export const DEFAULT_BLOCK_WIDTHS: Partial<Record<CanvasBlockType, number>> = {
  ArticleTitle: 88,
  ArticleLead: 80,
  ArticleBody: 75,
  ArticleSection: 78,
  ArticleHero: 70,
  ArticleImage: 55,
  ArticleAudio: 52,
  ArticleVideo: 58,
  ArticleDivider: 40,
}

export interface CanvasBlockProps extends Record<string, unknown> {
  blockId?: string
  layout?: CanvasBlockLayout
  style?: Partial<CanvasBlockStyle>
}

export const TEXT_CANVAS_BLOCK_TYPES: CanvasBlockType[] = [
  'ArticleTitle',
  'ArticleLead',
  'ArticleBody',
  'ArticleSection',
]

export function isTextCanvasBlock(type: CanvasBlockType): boolean {
  return TEXT_CANVAS_BLOCK_TYPES.includes(type)
}

export const IMAGE_CANVAS_BLOCK_TYPES: CanvasBlockType[] = ['ArticleImage', 'ArticleHero']

export function isImageCanvasBlock(type: CanvasBlockType): boolean {
  return IMAGE_CANVAS_BLOCK_TYPES.includes(type)
}

export const AUDIO_CANVAS_BLOCK_TYPES: CanvasBlockType[] = ['ArticleAudio']

export function isAudioCanvasBlock(type: CanvasBlockType): boolean {
  return AUDIO_CANVAS_BLOCK_TYPES.includes(type)
}

export const VIDEO_CANVAS_BLOCK_TYPES: CanvasBlockType[] = ['ArticleVideo']

export function isVideoCanvasBlock(type: CanvasBlockType): boolean {
  return VIDEO_CANVAS_BLOCK_TYPES.includes(type)
}
