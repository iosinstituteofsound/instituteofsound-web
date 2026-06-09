export type ProfilePhotoKind = 'avatar' | 'cover'

const STORAGE_PREFIX = 'ios_profile_photos_'
const MAX_HISTORY = 24

function storageKey(userId: string, kind: ProfilePhotoKind): string {
  return `${STORAGE_PREFIX}${kind}_${userId}`
}

export function getProfilePhotoHistory(userId: string, kind: ProfilePhotoKind): string[] {
  try {
    const raw = localStorage.getItem(storageKey(userId, kind))
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter((u): u is string => typeof u === 'string' && u.trim().length > 0)
  } catch {
    return []
  }
}

export function addProfilePhotoHistory(userId: string, kind: ProfilePhotoKind, url: string): void {
  const trimmed = url.trim()
  if (!trimmed) return
  const next = [trimmed, ...getProfilePhotoHistory(userId, kind).filter((u) => u !== trimmed)].slice(
    0,
    MAX_HISTORY,
  )
  try {
    localStorage.setItem(storageKey(userId, kind), JSON.stringify(next))
  } catch {
    /* ignore quota */
  }
}

export function buildProfilePhotoSuggestions(input: {
  userId: string
  kind: ProfilePhotoKind
  currentUrl?: string
  postImageUrls?: string[]
}): string[] {
  const history = getProfilePhotoHistory(input.userId, input.kind)
  const merged = [
    ...history,
    input.currentUrl?.trim(),
    ...(input.postImageUrls ?? []).map((u) => u.trim()),
  ].filter((u): u is string => Boolean(u))
  return [...new Set(merged)].slice(0, 12)
}
