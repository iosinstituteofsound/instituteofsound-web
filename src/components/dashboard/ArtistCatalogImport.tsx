import { useMemo, useState } from 'react'
import type { ArtistAlbum, ArtistTrack, ArtistVideo } from '@/lib/artist-profile/types'
import {
  addArtistAlbum,
  addArtistTrack,
  addArtistVideo,
} from '@/lib/artist-profile/service'
import { fetchArtistCatalogFromUrl } from '@/lib/media/catalog/fetchCatalog'
import type {
  ArtistCatalogImportResult,
  CatalogImportItem,
  CatalogImportSuggestions,
} from '@/lib/media/catalog/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { IOSImage } from '@/components/ui/IOSImage'

export interface CatalogProfileSuggestions {
  displayName?: string
  tagline?: string
  avatarUrl?: string
  bannerUrl?: string
  genresText?: string
  spotify?: string
  youtube?: string
}

interface ArtistCatalogImportProps {
  initialUrl?: string
  tracks: ArtistTrack[]
  albums: ArtistAlbum[]
  videos: ArtistVideo[]
  ensureProfile: () => Promise<{ id: string }>
  onReload: (profileId: string) => Promise<void>
  onApplySuggestions?: (suggestions: CatalogProfileSuggestions) => void
  onImportMessage?: (message: string) => void
}

function kindLabel(kind: CatalogImportItem['kind']): string {
  if (kind === 'track') return 'Track'
  if (kind === 'video') return 'Video'
  if (kind === 'single') return 'Single'
  if (kind === 'ep') return 'EP'
  return 'Album'
}

function suggestionsToPayload(s: CatalogImportSuggestions): CatalogProfileSuggestions {
  return {
    displayName: s.displayName,
    tagline: s.tagline,
    avatarUrl: s.avatarUrl,
    bannerUrl: s.bannerUrl,
    genresText: s.genres?.join(', '),
    spotify: s.spotifyUrl,
    youtube: s.youtubeUrl,
  }
}

export function ArtistCatalogImport({
  initialUrl = '',
  tracks,
  albums,
  videos,
  ensureProfile,
  onReload,
  onApplySuggestions,
  onImportMessage,
}: ArtistCatalogImportProps) {
  const [profileUrl, setProfileUrl] = useState(initialUrl)
  const [fetching, setFetching] = useState(false)
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState('')
  const [catalog, setCatalog] = useState<ArtistCatalogImportResult | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [applyProfile, setApplyProfile] = useState(true)

  const isDuplicate = useMemo(() => {
    const trackUrls = new Set(tracks.map((t) => t.streamUrl.trim().toLowerCase()))
    const videoUrls = new Set(videos.map((v) => v.videoUrl.trim().toLowerCase()))
    const albumTitles = new Set(albums.map((a) => a.title.trim().toLowerCase()))
    return (item: CatalogImportItem) => {
      const url = item.streamUrl.trim().toLowerCase()
      if (item.kind === 'track') return trackUrls.has(url)
      if (item.kind === 'video') return videoUrls.has(url)
      return albumTitles.has(item.title.trim().toLowerCase())
    }
  }, [tracks, albums, videos])

  const selectableItems = useMemo(() => {
    if (!catalog) return []
    return catalog.items.filter((item) => !isDuplicate(item))
  }, [catalog, isDuplicate])

  const fetchCatalog = async () => {
    setFetching(true)
    setError('')
    setCatalog(null)
    try {
      const result = await fetchArtistCatalogFromUrl(profileUrl)
      setCatalog(result)
      if (result.warnings.length > 0 && result.items.length === 0) {
        setError(result.warnings.join(' '))
      }
      const dup = (item: CatalogImportItem) => {
        const url = item.streamUrl.trim().toLowerCase()
        if (item.kind === 'track') return tracks.some((t) => t.streamUrl.trim().toLowerCase() === url)
        if (item.kind === 'video') return videos.some((v) => v.videoUrl.trim().toLowerCase() === url)
        return albums.some((a) => a.title.trim().toLowerCase() === item.title.trim().toLowerCase())
      }
      const ids = new Set(result.items.filter((item) => !dup(item)).map((item) => item.id))
      setSelected(ids)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fetch failed')
    } finally {
      setFetching(false)
    }
  }

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = (on: boolean) => {
    if (on) setSelected(new Set(selectableItems.map((i) => i.id)))
    else setSelected(new Set())
  }

  const importSelected = async () => {
    if (!catalog || selected.size === 0) return
    setImporting(true)
    setError('')
    try {
      const profile = await ensureProfile()
      const chosen = catalog.items.filter((item) => selected.has(item.id))

      for (const item of chosen) {
        if (item.kind === 'track') {
          await addArtistTrack(profile.id, {
            title: item.title,
            streamUrl: item.streamUrl,
            coverUrl: item.coverUrl,
            playCount: item.playCount,
          })
        } else if (item.kind === 'video') {
          await addArtistVideo(profile.id, {
            title: item.title,
            videoUrl: item.streamUrl,
            thumbnailUrl: item.coverUrl,
          })
        } else {
          await addArtistAlbum(profile.id, {
            title: item.title,
            coverUrl: item.coverUrl,
            releaseYear: item.releaseYear,
            releaseType: item.kind === 'single' ? 'single' : item.kind === 'ep' ? 'ep' : 'album',
          })
        }
      }

      if (applyProfile && onApplySuggestions && catalog.suggestions) {
        onApplySuggestions(suggestionsToPayload(catalog.suggestions))
      }

      const alreadyOnProfile = catalog.items.filter((item) => isDuplicate(item)).length
      onImportMessage?.(
        `${chosen.length} new item${chosen.length === 1 ? '' : 's'} added` +
          (alreadyOnProfile > 0 ? ` · ${alreadyOnProfile} already on profile (skipped)` : '')
      )

      await onReload(profile.id)
      setCatalog(null)
      setSelected(new Set())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed')
    } finally {
      setImporting(false)
    }
  }

  return (
    <section className="ios-panel space-y-4 border border-mh-red/30">
      <div>
        <p className="ios-kicker">Import / re-import catalog</p>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
          Spotify / YouTube / SoundCloud profile URL se fetch karo. Dubara import = sirf naye items.
          Agar Spotify 403 aaye (Premium same email pe bhi): Spotify ko sync hone do (24h) ya neeche{' '}
          <strong className="text-foreground">Tracks → Quick add</strong> se track links paste karo.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Input
          type="url"
          placeholder="https://open.spotify.com/artist/…"
          value={profileUrl}
          onChange={(e) => setProfileUrl(e.target.value)}
          className="flex-1 min-w-[220px]"
        />
        <Button type="button" variant="metal" disabled={fetching || !profileUrl.trim()} onClick={fetchCatalog}>
          {fetching ? 'Fetching…' : 'Fetch / re-fetch'}
        </Button>
      </div>

      {catalog && (
        <div className="space-y-4 border border-border p-4">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-wide">
                {catalog.platform} · {catalog.items.length} items
              </p>
              {catalog.suggestions.displayName && (
                <p className="text-xs text-muted-foreground">{catalog.suggestions.displayName}</p>
              )}
              <p className="text-[10px] text-muted-foreground mt-1">
                {selectableItems.length} new · {catalog.items.length - selectableItems.length} already on profile
              </p>
            </div>
            {selectableItems.length > 0 && (
              <div className="flex gap-2 text-xs">
                <button type="button" className="ios-link" onClick={() => toggleAll(true)}>
                  Select all
                </button>
                <span className="text-muted">|</span>
                <button type="button" className="ios-link" onClick={() => toggleAll(false)}>
                  Clear
                </button>
              </div>
            )}
          </div>

          {catalog.warnings.map((w) => (
            <p key={w} className="text-xs text-amber-400/90 border-l-2 border-amber-500 pl-3">
              {w}
            </p>
          ))}

          {onApplySuggestions && catalog.suggestions.displayName && (
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={applyProfile}
                onChange={(e) => setApplyProfile(e.target.checked)}
                className="accent-mh-red"
              />
              Profile name, image, genres & social link bhi update karo
            </label>
          )}

          <ul className="space-y-2 max-h-72 overflow-y-auto">
            {catalog.items.map((item) => {
              const duplicate = isDuplicate(item)
              return (
                <li
                  key={item.id}
                  className={`flex gap-3 items-center border px-3 py-2 text-sm ${
                    duplicate ? 'border-border/50 opacity-50' : 'border-border'
                  }`}
                >
                  <input
                    type="checkbox"
                    disabled={duplicate}
                    checked={selected.has(item.id)}
                    onChange={() => toggle(item.id)}
                    className="accent-mh-red shrink-0"
                  />
                  {item.coverUrl ? (
                    <IOSImage
                      src={item.coverUrl}
                      alt=""
                      className="!w-10 !h-10 shrink-0 object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-surface shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{item.title}</p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {kindLabel(item.kind)}
                      {duplicate ? ' · already added' : ''}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>

          {selectableItems.length > 0 && (
            <Button
              type="button"
              variant="primary"
              disabled={importing || selected.size === 0}
              onClick={importSelected}
            >
              {importing ? 'Importing…' : `Import ${selected.size} selected`}
            </Button>
          )}
        </div>
      )}

      {error && <p className="text-mh-red text-sm">{error}</p>}

      <p className="text-[10px] text-muted-foreground leading-relaxed">
        Spotify: dashboard pe app banao (Web API tick ab form mein nahi hota — normal hai), phir Client ID/Secret →{' '}
        <code className="text-foreground">SPOTIFY_CLIENT_ID</code>, <code className="text-foreground">SPOTIFY_CLIENT_SECRET</code>{' '}
        on Vercel. App owner ko Spotify Premium chahiye (2026 dev mode). Optional: <code className="text-foreground">YOUTUBE_API_KEY</code>.
      </p>
    </section>
  )
}
