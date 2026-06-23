import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Loader2, Pencil, Play, Search, X } from 'lucide-react'
import type { ReleaseDto } from '@/modules/explore/types/explore.types'
import { ReleaseVinylArt } from '@/modules/explore/components/release-vinyl-art'
import { useLabelFeaturedReleaseSearch } from '@/modules/profile/hooks/use-label-featured-release-search'
import { useUpdateLabelProfile } from '@/modules/profile/hooks/use-update-label-profile'
import {
  labelOverviewReleaseMeta,
  labelOverviewReleaseTagline,
} from '@/modules/profile/lib/label-overview-format'
import { usePlayerStore } from '@/modules/player/stores/player-store'
import { releaseDtoToPlayerTrack } from '@/modules/music/lib/player-track-builders'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { toast } from '@/shared/components/ui/sonner'
import { cn } from '@/shared/lib/cn'
import '@/modules/explore/styles/release-vinyl-art.css'
import '@/modules/profile/styles/label-overview-featured.css'

const FEATURED_MAX = 5

type LabelOverviewFeaturedReleaseProps = {
  releases: ReleaseDto[]
  editable?: boolean
  userId?: string
}

export function LabelOverviewFeaturedRelease({
  releases,
  editable,
  userId,
}: LabelOverviewFeaturedReleaseProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [editing, setEditing] = useState(false)
  const [query, setQuery] = useState('')
  const [draftReleases, setDraftReleases] = useState<ReleaseDto[]>(() => [...releases])
  const playTrack = usePlayerStore((state) => state.playTrack)
  const updateLabel = useUpdateLabelProfile(userId ?? '')
  const search = useLabelFeaturedReleaseSearch(query, editing)

  useEffect(() => {
    if (!editing) setDraftReleases([...releases])
  }, [releases, editing])

  useEffect(() => {
    if (activeIndex >= releases.length) setActiveIndex(0)
  }, [activeIndex, releases.length])

  const displayReleases = releases

  if (!editable && displayReleases.length === 0) return null

  const startEdit = () => {
    setDraftReleases([...releases])
    setQuery('')
    setEditing(true)
  }

  const cancelEdit = () => {
    setDraftReleases([...releases])
    setQuery('')
    setEditing(false)
  }

  const addRelease = (release: ReleaseDto) => {
    if (draftReleases.some((entry) => entry.id === release.id) || draftReleases.length >= FEATURED_MAX) return
    setDraftReleases((current) => [...current, release])
  }

  const removeRelease = (id: string) => {
    setDraftReleases((current) => current.filter((release) => release.id !== id))
  }

  const saveFeatured = async () => {
    const ids = draftReleases.filter((release) => !release.id.startsWith('demo-')).map((release) => release.id)
    try {
      await updateLabel.mutateAsync({ featuredReleaseIds: ids })
      setEditing(false)
      toast.success('Featured releases saved')
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Could not save featured releases'
      toast.error(message)
    }
  }

  const searchResults = useMemo(() => {
    const results = search.data ?? []
    const selected = new Set(draftReleases.map((release) => release.id))
    return results.filter((release) => !selected.has(release.id))
  }, [draftReleases, search.data])

  const release = displayReleases[Math.min(activeIndex, Math.max(displayReleases.length - 1, 0))]
  const canPlay = Boolean(release?.streamUrl)
  const isDemoRelease = release?.id.startsWith('demo-') ?? false

  return (
    <section
      className={cn('lbl-ov-featured', editable && 'lbl-ov-featured--editable', editing && 'lbl-ov-featured--editing')}
      aria-labelledby="lbl-ov-featured-heading"
    >
      <span className="lbl-ov-featured__glow" aria-hidden />

      <header className="lbl-ov-featured__head">
        <p id="lbl-ov-featured-heading" className="lbl-ov-featured__kicker">
          <span className="lbl-ov-featured__kicker-dot" aria-hidden />
          Featured Release
        </p>

        {editable ? (
          <div className="lbl-ov-featured__head-actions">
            <span className="lbl-ov-featured__head-meta lbl-ov-featured__head-meta--live">LIVE</span>
            <button
              type="button"
              className="lbl-ov-featured__head-meta lbl-ov-featured__head-meta--edit"
              onClick={startEdit}
              aria-label="Edit featured releases"
            >
              <Pencil size={10} strokeWidth={2} aria-hidden />
              Edit
            </button>
          </div>
        ) : null}
      </header>

      {editing ? (
        <div className="lbl-ov-featured__editor">
          <p className="lbl-ov-featured__editor-label">:: Assign spotlight queue (max {FEATURED_MAX})</p>

          <ul className="lbl-ov-featured__editor-slots">
            {Array.from({ length: FEATURED_MAX }, (_, index) => {
              const slotRelease = draftReleases[index]
              const channel = String(index + 1).padStart(2, '0')
              return (
                <li key={channel} className="lbl-ov-featured__editor-slot">
                  <span className="lbl-ov-featured__editor-slot-id">{channel}</span>
                  {slotRelease ? (
                    <>
                      <span className="lbl-ov-featured__editor-thumb-wrap">
                        {slotRelease.coverUrl ? (
                          <img
                            src={slotRelease.coverUrl}
                            alt=""
                            loading="lazy"
                            className="lbl-ov-featured__editor-thumb"
                          />
                        ) : (
                          <span className="lbl-ov-featured__editor-thumb lbl-ov-featured__editor-thumb--empty" />
                        )}
                      </span>
                      <div className="lbl-ov-featured__editor-slot-copy">
                        <p className="lbl-ov-featured__editor-slot-title">{slotRelease.title}</p>
                        <p className="lbl-ov-featured__editor-slot-artist">{slotRelease.artistName ?? 'Artist'}</p>
                      </div>
                      <button
                        type="button"
                        className="lbl-ov-featured__editor-remove"
                        onClick={() => removeRelease(slotRelease.id)}
                        aria-label={`Remove ${slotRelease.title}`}
                      >
                        <X size={12} strokeWidth={2.25} aria-hidden />
                      </button>
                    </>
                  ) : (
                    <span className="lbl-ov-featured__editor-empty">Empty channel</span>
                  )}
                </li>
              )
            })}
          </ul>

          <label className="lbl-ov-featured__editor-search" htmlFor="lbl-ov-featured-search">
            <Search size={14} strokeWidth={2} aria-hidden />
            <Input
              id="lbl-ov-featured-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search releases on IOS..."
              className="lbl-ov-featured__editor-search-input"
            />
          </label>

          {search.isFetching ? (
            <p className="lbl-ov-featured__editor-hint">
              <Loader2 className="inline h-3.5 w-3.5 animate-spin" /> Scanning catalog...
            </p>
          ) : null}

          {searchResults.length > 0 ? (
            <ul className="lbl-ov-featured__editor-results">
              {searchResults.map((result) => (
                <li key={result.id}>
                  <button type="button" className="lbl-ov-featured__editor-result" onClick={() => addRelease(result)}>
                    <span className="lbl-ov-featured__editor-thumb-wrap">
                      {result.coverUrl ? (
                        <img src={result.coverUrl} alt="" loading="lazy" className="lbl-ov-featured__editor-thumb" />
                      ) : (
                        <span className="lbl-ov-featured__editor-thumb lbl-ov-featured__editor-thumb--empty" />
                      )}
                    </span>
                    <span className="lbl-ov-featured__editor-slot-copy">
                      <span className="lbl-ov-featured__editor-slot-title">{result.title}</span>
                      <span className="lbl-ov-featured__editor-slot-artist">{result.artistName ?? 'Artist'}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : query.trim().length >= 2 && !search.isFetching ? (
            <p className="lbl-ov-featured__editor-hint">No releases matched that search.</p>
          ) : (
            <p className="lbl-ov-featured__editor-hint">Type at least 2 characters to search releases.</p>
          )}

          <div className="lbl-ov-featured__editor-actions">
            <Button type="button" variant="outline" size="sm" onClick={cancelEdit}>
              Cancel
            </Button>
            <Button type="button" size="sm" onClick={saveFeatured} disabled={updateLabel.isPending}>
              {updateLabel.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
            </Button>
          </div>
        </div>
      ) : release ? (
        <>
          <div className="lbl-ov-featured__body">
            <div className="lbl-ov-featured__art">
              <ReleaseVinylArt release={release} variant="hero" className="lbl-ov-featured__vinyl" />
            </div>

            <div className="lbl-ov-featured__copy">
              <p className="lbl-ov-featured__tag">New Release</p>
              <h2 className="lbl-ov-featured__title">{release.title}</h2>
              <p className="lbl-ov-featured__artist">
                by <span>{release.artistName ?? 'Unknown Artist'}</span>
              </p>
              <p className="lbl-ov-featured__desc">{labelOverviewReleaseTagline(release)}</p>
              <p className="lbl-ov-featured__meta">{labelOverviewReleaseMeta(release)}</p>

              <div className="lbl-ov-featured__actions">
                {canPlay ? (
                  <button
                    type="button"
                    className="lbl-ov-featured__listen"
                    onClick={() => {
                      const track = releaseDtoToPlayerTrack(release)
                      if (!track) return
                      playTrack(track)
                    }}
                  >
                    <Play size={12} strokeWidth={2.5} fill="currentColor" aria-hidden />
                    Listen Now
                  </button>
                ) : (
                  <span className="lbl-ov-featured__listen lbl-ov-featured__listen--disabled">Listen Soon</span>
                )}

                {isDemoRelease ? (
                  <span className="lbl-ov-featured__details lbl-ov-featured__details--muted">Demo Release</span>
                ) : (
                  <Link to={`/releases/${release.id}`} className="lbl-ov-featured__details">
                    View Details
                    <ArrowRight size={14} strokeWidth={2.25} aria-hidden />
                  </Link>
                )}
              </div>
            </div>
          </div>

          {displayReleases.length > 1 ? (
            <div className="lbl-ov-featured__dots" role="tablist" aria-label="Featured releases">
              {displayReleases.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={index === activeIndex ? 'true' : 'false'}
                  aria-label={`Show ${item.title}`}
                  className={cn('lbl-ov-featured__dot', index === activeIndex && 'lbl-ov-featured__dot--active')}
                  onClick={() => setActiveIndex(index)}
                />
              ))}
            </div>
          ) : null}
        </>
      ) : editable ? (
        <div className="lbl-ov-featured__empty">
          <p>No featured release yet.</p>
          <Button type="button" size="sm" variant="outline" onClick={startEdit}>
            Set featured release
          </Button>
        </div>
      ) : null}
    </section>
  )
}
