import type { UserDto } from '@/shared/types/auth.types'

export type PhotoAlbum = {
  id: string
  title: string
  photos: string[]
}

const STORAGE_KEY = 'ios-profile-photo-uploads'

export function getStoredUploads(userId: string): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Record<string, string[]>
    return parsed[userId] ?? []
  } catch {
    return []
  }
}

export function addStoredUpload(userId: string, url: string) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? (JSON.parse(raw) as Record<string, string[]>) : {}
    const existing = parsed[userId] ?? []
    parsed[userId] = [url, ...existing.filter((u) => u !== url)].slice(0, 48)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed))
  } catch {
    // ignore
  }
}

export function buildRecentPhotos(user: UserDto, extra: string[] = []): string[] {
  const stored = getStoredUploads(user.id)
  return [...new Set([...extra, user.avatarUrl, user.coverUrl, ...stored].filter(Boolean))] as string[]
}

export function buildPhotoAlbums(user: UserDto, recent: string[]): PhotoAlbum[] {
  const stored = getStoredUploads(user.id)
  const profilePictures = [user.avatarUrl].filter(Boolean) as string[]
  const coverPhotos = [user.coverUrl].filter(Boolean) as string[]

  const albums: PhotoAlbum[] = [
    {
      id: 'photos-of-you',
      title: 'Photos of you',
      photos: recent,
    },
    {
      id: 'profile-pictures',
      title: 'Profile pictures',
      photos: profilePictures,
    },
    {
      id: 'cover-photos',
      title: 'Cover photos',
      photos: coverPhotos,
    },
    {
      id: 'uploads',
      title: 'Uploads',
      photos: stored,
    },
  ]

  return albums.filter((album) => album.photos.length > 0)
}
