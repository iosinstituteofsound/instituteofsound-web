import { useEffect, useState } from 'react'
import {
  extractPlaylistCoverTheme,
  fallbackPlaylistCoverTheme,
  type PlaylistCoverTheme,
} from '@/modules/music/lib/playlist-cover-theme'

export function usePlaylistCoverTheme(coverUrl: string | undefined, slug: string) {
  const [theme, setTheme] = useState<PlaylistCoverTheme>(() => fallbackPlaylistCoverTheme(slug))

  useEffect(() => {
    const fallback = fallbackPlaylistCoverTheme(slug)
    const url =
      coverUrl?.trim() ||
      `https://picsum.photos/seed/playlist-${slug}/96/96`

    let cancelled = false
    void extractPlaylistCoverTheme(url).then((extracted) => {
      if (cancelled) return
      setTheme(extracted ?? fallback)
    })

    return () => {
      cancelled = true
    }
  }, [coverUrl, slug])

  return theme
}
