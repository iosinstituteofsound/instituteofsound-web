import {
  Brush,
  Eraser,
  Frame,
  Hand,
  Image as ImageIcon,
  MousePointer2,
  PaintBucket,
  Palette,
  Shapes,
  Sparkles,
  Sticker,
  Type,
  Wand2,
  ZoomIn,
} from 'lucide-react'
import type { AssetTabId, LayerRow, StudioToolId } from '@/modules/illustrator/components/studio/studio-types'

export const STUDIO_TOOLS: Array<{ id: StudioToolId; label: string; icon: typeof Brush; shortcut?: string }> = [
  { id: 'select', label: 'Select', icon: MousePointer2, shortcut: 'V' },
  { id: 'brush', label: 'Brush', icon: Brush, shortcut: 'B' },
  { id: 'erase', label: 'Erase', icon: Eraser, shortcut: 'E' },
  { id: 'smudge', label: 'Smudge', icon: Hand, shortcut: 'S' },
  { id: 'fill', label: 'Fill', icon: PaintBucket, shortcut: 'G' },
  { id: 'gradient', label: 'Gradient', icon: Palette, shortcut: 'U' },
  { id: 'shape', label: 'Shape', icon: Shapes, shortcut: 'R' },
  { id: 'text', label: 'Text', icon: Type, shortcut: 'T' },
  { id: 'image', label: 'Image', icon: ImageIcon, shortcut: 'I' },
  { id: 'sticker', label: 'Sticker', icon: Sticker, shortcut: 'K' },
  { id: 'frame', label: 'Frame', icon: Frame, shortcut: 'F' },
  { id: 'ai', label: 'AI', icon: Sparkles, shortcut: 'A' },
  { id: 'zoom', label: 'Zoom', icon: ZoomIn, shortcut: 'Z' },
  { id: 'hand', label: 'Hand', icon: Hand, shortcut: 'H' },
]

export const ASSET_TABS: AssetTabId[] = ['assets', 'brushes', 'textures', 'fonts', 'patterns']

export const ASSET_SECTIONS = ['Recent', 'My Images', 'Stickers', 'Textures', 'Palettes', 'Brush Packs'] as const

export const LAYER_TREE: LayerRow[] = [
  { id: 'g1', label: 'Environment', depth: 0, folder: true },
  { id: 'moon', label: 'Moon', depth: 1, tag: '#E85D5D', fx: true },
  { id: 'clouds', label: 'Clouds', depth: 1, tag: '#8B9BB4' },
  { id: 'castle', label: 'Castle', depth: 1, tag: '#6B4FBB', fx: true },
  { id: 'g2', label: 'Character', depth: 0, folder: true },
  { id: 'hood', label: 'Hooded Figure', depth: 1, tag: '#C4A574' },
  { id: 'fg', label: 'Foreground', depth: 0, fx: true },
  { id: 'bg', label: 'Background', depth: 0, tag: '#FFFFFF' },
]

export const AI_ACTIONS = [
  { id: 'expand', title: 'Expand', desc: 'Extend canvas with generative fill', icon: Wand2 },
  { id: 'remove-bg', title: 'Remove Background', desc: 'Isolate subject in one tap', icon: Sparkles },
  { id: 'vectorize', title: 'Vectorize', desc: 'Convert raster to clean vectors', icon: Shapes },
  { id: 'recolor', title: 'Recolor', desc: 'Shift palette with AI harmony', icon: Palette },
  { id: 'upscale', title: 'Upscale', desc: '4× detail recovery', icon: ZoomIn },
  { id: 'generate', title: 'Generate', desc: 'Create from text prompt', icon: Sparkles },
  { id: 'inpaint', title: 'Inpaint', desc: 'Paint over and regenerate', icon: Brush },
  { id: 'texture', title: 'Generate Texture', desc: 'Seamless material maps', icon: PaintBucket },
] as const

export const PROPERTY_SECTIONS = [
  { id: 'canvas', label: 'Canvas', open: true },
  { id: 'transform', label: 'Transform', open: true },
  { id: 'effects', label: 'Effects', open: true },
  { id: 'color', label: 'Color', open: false },
  { id: 'shadow', label: 'Shadow', open: false },
  { id: 'glow', label: 'Glow', open: false },
  { id: 'stroke', label: 'Stroke', open: false },
  { id: 'mask', label: 'Mask', open: false },
  { id: 'blend', label: 'Blend', open: false },
  { id: 'type', label: 'Typography', open: false },
] as const
