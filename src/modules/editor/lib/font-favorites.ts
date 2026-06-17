const STORAGE_KEY = 'ios-editor-font-favorites'

function readFavorites(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : []
  } catch {
    return []
  }
}

function writeFavorites(favorites: string[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
}

export function getFontFavorites(): string[] {
  return readFavorites()
}

export function addFontFavorite(family: string): string[] {
  const favorites = readFavorites()
  if (favorites.includes(family)) return favorites
  const next = [...favorites, family]
  writeFavorites(next)
  return next
}

export function removeFontFavorite(family: string): string[] {
  const next = readFavorites().filter((item) => item !== family)
  writeFavorites(next)
  return next
}
