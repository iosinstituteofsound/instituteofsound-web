export const STORY_BACKGROUND_OPTIONS = [
  { id: 'blue', gradient: 'from-blue-600 to-cyan-400' },
  { id: 'violet', gradient: 'from-violet-700 to-fuchsia-500' },
  { id: 'pink', gradient: 'from-rose-600 to-pink-500' },
  { id: 'orange', gradient: 'from-orange-500 to-amber-400' },
  { id: 'green', gradient: 'from-emerald-600 to-lime-400' },
  { id: 'sky', gradient: 'from-sky-600 to-cyan-300' },
  { id: 'purple', gradient: 'from-purple-700 to-indigo-500' },
  { id: 'red', gradient: 'from-red-600 to-orange-500' },
  { id: 'teal', gradient: 'from-teal-600 to-emerald-400' },
  { id: 'sunset', gradient: 'from-fuchsia-600 to-orange-400' },
  { id: 'night', gradient: 'from-slate-800 to-indigo-900' },
  { id: 'gold', gradient: 'from-yellow-500 to-amber-600' },
  { id: 'mint', gradient: 'from-green-400 to-teal-500' },
  { id: 'berry', gradient: 'from-pink-600 to-purple-700' },
  { id: 'ocean', gradient: 'from-blue-800 to-teal-500' },
  { id: 'fire', gradient: 'from-red-700 to-yellow-500' },
  { id: 'lavender', gradient: 'from-violet-400 to-pink-300' },
  { id: 'forest', gradient: 'from-green-700 to-emerald-900' },
] as const

export type StoryBackgroundId = (typeof STORY_BACKGROUND_OPTIONS)[number]['id']

export function storyGradientClass(id?: string | null) {
  const match = STORY_BACKGROUND_OPTIONS.find((option) => option.id === id)
  return match?.gradient ?? STORY_BACKGROUND_OPTIONS[0].gradient
}

export const STORY_TEXT_STYLES = [
  { id: 'clean', label: 'Aa Clean', className: 'font-sans font-semibold' },
  { id: 'bold', label: 'Aa Bold', className: 'font-sans font-black tracking-tight' },
  { id: 'classic', label: 'Aa Classic', className: 'font-serif font-bold' },
] as const

export type StoryTextStyleId = (typeof STORY_TEXT_STYLES)[number]['id']

export function storyTextStyleClass(id?: string | null) {
  const match = STORY_TEXT_STYLES.find((option) => option.id === id)
  return match?.className ?? STORY_TEXT_STYLES[0].className
}
