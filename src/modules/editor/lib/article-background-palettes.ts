export interface BackgroundPaletteStrip {
  id: string
  colors: string[]
}

export interface BackgroundPaletteCombo {
  id: string
  colors: string[]
}

/** Horizontal gradient strips — pick any swatch */
export const BACKGROUND_PALETTE_STRIPS: BackgroundPaletteStrip[] = [
  { id: 'rose', colors: ['#fff1f2', '#fecdd3', '#fb7185', '#e11d48', '#881337'] },
  { id: 'orange', colors: ['#fff7ed', '#fed7aa', '#fb923c', '#ea580c', '#7c2d12'] },
  { id: 'amber', colors: ['#fffbeb', '#fde68a', '#fbbf24', '#d97706', '#78350f'] },
  { id: 'lime', colors: ['#f7fee7', '#bef264', '#84cc16', '#4d7c0f', '#1a2e05'] },
  { id: 'green', colors: ['#ecfdf5', '#6ee7b7', '#10b981', '#047857', '#064e3b'] },
  { id: 'teal', colors: ['#f0fdfa', '#5eead4', '#14b8a6', '#0f766e', '#134e4a'] },
  { id: 'cyan', colors: ['#ecfeff', '#67e8f9', '#06b6d4', '#0e7490', '#164e63'] },
  { id: 'sky', colors: ['#f0f9ff', '#7dd3fc', '#38bdf8', '#0284c7', '#0c4a6e'] },
  { id: 'blue', colors: ['#eff6ff', '#93c5fd', '#3b82f6', '#1d4ed8', '#1e3a8a'] },
  { id: 'indigo', colors: ['#eef2ff', '#a5b4fc', '#6366f1', '#4338ca', '#312e81'] },
  { id: 'violet', colors: ['#f5f3ff', '#c4b5fd', '#8b5cf6', '#6d28d9', '#4c1d95'] },
  { id: 'fuchsia', colors: ['#fdf4ff', '#f0abfc', '#d946ef', '#a21caf', '#701a75'] },
  { id: 'pink', colors: ['#fdf2f8', '#f9a8d4', '#ec4899', '#be185d', '#831843'] },
  { id: 'slate', colors: ['#f8fafc', '#cbd5e1', '#64748b', '#334155', '#0f172a'] },
  { id: 'stone', colors: ['#fafaf9', '#d6d3d1', '#78716c', '#44403c', '#1c1917'] },
  { id: 'neutral', colors: ['#fafafa', '#d4d4d4', '#737373', '#404040', '#171717'] },
  { id: 'warm-gray', colors: ['#fafaf9', '#d6d3d1', '#a8a29e', '#57534e', '#292524'] },
  { id: 'cool-gray', colors: ['#f9fafb', '#d1d5db', '#9ca3af', '#4b5563', '#111827'] },
  { id: 'grayscale', colors: ['#ffffff', '#e5e5e5', '#a3a3a3', '#525252', '#000000'] },
]

/** Multi-hue combo palettes */
export const BACKGROUND_PALETTE_COMBOS: BackgroundPaletteCombo[] = [
  { id: 'sunset', colors: ['#fef3c7', '#fdba74', '#f97316', '#dc2626', '#7f1d1d'] },
  { id: 'ocean', colors: ['#cffafe', '#67e8f9', '#0ea5e9', '#1d4ed8', '#1e1b4b'] },
  { id: 'forest', colors: ['#d9f99d', '#4ade80', '#16a34a', '#14532d', '#052e16'] },
  { id: 'berry', colors: ['#fce7f3', '#f472b6', '#c026d3', '#6b21a8', '#3b0764'] },
  { id: 'citrus', colors: ['#fef08a', '#facc15', '#f97316', '#ea580c', '#7c2d12'] },
  { id: 'lavender', colors: ['#ede9fe', '#c4b5fd', '#8b5cf6', '#5b21b6', '#2e1065'] },
  { id: 'mint', colors: ['#ccfbf1', '#5eead4', '#2dd4bf', '#0d9488', '#134e4a'] },
  { id: 'coral', colors: ['#ffe4e6', '#fda4af', '#fb7185', '#f43f5e', '#9f1239'] },
  { id: 'sand', colors: ['#fff7ed', '#fed7aa', '#d6d3d1', '#a8a29e', '#57534e'] },
  { id: 'midnight', colors: ['#dbeafe', '#60a5fa', '#1e40af', '#1e3a8a', '#020617'] },
  { id: 'neon', colors: ['#fef08a', '#4ade80', '#22d3ee', '#a78bfa', '#f472b6'] },
  { id: 'earth', colors: ['#fef3c7', '#d6d3d1', '#a16207', '#78350f', '#292524'] },
  { id: 'ice', colors: ['#f0f9ff', '#bae6fd', '#7dd3fc', '#38bdf8', '#0c4a6e'] },
  { id: 'wine', colors: ['#fce7f3', '#fda4af', '#be123c', '#881337', '#450a0a'] },
  { id: 'retro', colors: ['#fef9c3', '#fdba74', '#f472b6', '#818cf8', '#14b8a6'] },
  { id: 'mono-blue', colors: ['#eff6ff', '#bfdbfe', '#60a5fa', '#2563eb', '#1e3a8a'] },
  { id: 'mono-green', colors: ['#ecfdf5', '#a7f3d0', '#34d399', '#059669', '#064e3b'] },
  { id: 'mono-purple', colors: ['#faf5ff', '#e9d5ff', '#c084fc', '#9333ea', '#581c87'] },
  { id: 'editorial', colors: ['#fafaf9', '#e7e5e4', '#a8a29e', '#57534e', '#1c1917'] },
  { id: 'studio', colors: ['#f4f4f5', '#d4d4d8', '#71717a', '#3f3f46', '#18181b'] },
  { id: 'warm-dark', colors: ['#fde68a', '#f59e0b', '#b45309', '#78350f', '#292524'] },
  { id: 'cool-dark', colors: ['#bae6fd', '#38bdf8', '#0369a1', '#1e3a8a', '#0f172a'] },
  { id: 'pop', colors: ['#fef08a', '#f472b6', '#60a5fa', '#4ade80', '#fb923c'] },
  { id: 'pastel', colors: ['#fce7f3', '#ddd6fe', '#bfdbfe', '#bbf7d0', '#fef08a'] },
]
