import { useCallback, useEffect, useState } from 'react'
import clsx from 'clsx'
import { Link } from 'react-router-dom'
import {
  addDiscoverPremierePick,
  listDiscoverPremierePicksForDesk,
  removeDiscoverPremierePick,
  searchArtistTracksForPremierePick,
  type DiscoverPremierePickRow,
  type PremiereBadge,
} from '@/lib/discovery/premieres'
import type { User } from '@/lib/auth/types'

interface DiscoverPremierePicksPanelProps {
  user: User
  className?: string
}

export function DiscoverPremierePicksPanel({ user, className }: DiscoverPremierePicksPanelProps) {
  const [picks, setPicks] = useState<DiscoverPremierePickRow[]>([])
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<
    Awaited<ReturnType<typeof searchArtistTracksForPremierePick>>
  >([])
  const [badge, setBadge] = useState<PremiereBadge>('wire_pick')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      setPicks(await listDiscoverPremierePicksForDesk())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      return
    }
    const t = window.setTimeout(() => {
      void searchArtistTracksForPremierePick(query).then(setResults).catch(() => setResults([]))
    }, 280)
    return () => window.clearTimeout(t)
  }, [query])

  async function handlePick(trackId: string, profileId: string) {
    setBusy(true)
    setMessage('')
    try {
      await addDiscoverPremierePick({
        trackId,
        profileId,
        pickedBy: user.id,
        badge,
      })
      setMessage('Premiere pick saved — shows first on Discover until removed.')
      setQuery('')
      setResults([])
      await refresh()
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Could not save pick')
    } finally {
      setBusy(false)
    }
  }

  async function handleRemove(id: string) {
    setBusy(true)
    try {
      await removeDiscoverPremierePick(id)
      await refresh()
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className={clsx('ios-card p-5', className)} aria-labelledby="premiere-picks-heading">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div>
          <h2 id="premiere-picks-heading" className="font-display text-xl font-bold">
            Discover premiere picks
          </h2>
          <p className="text-sm text-muted mt-1 max-w-xl">
            Spotlight a track from any published artist studio. Picks appear first on Explore →
            Releases; other artists rotate one random track per hour.
          </p>
          <Link to="/discover#discover-releases" className="text-xs text-mh-red mt-2 inline-block uppercase tracking-widest">
            Preview on Explore →
          </Link>
        </div>
        <button type="button" className="ios-btn ios-btn-ghost !text-xs" onClick={() => void refresh()}>
          Refresh
        </button>
      </div>

      {message && <p className="text-sm text-signal mb-4">{message}</p>}

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <p className="ios-kicker mb-2">Add pick</p>
          <input
            type="search"
            className="ios-input w-full mb-2"
            placeholder="Search artist or track…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <label className="text-xs text-muted block mb-1">Badge</label>
          <select
            className="ios-input w-full mb-3"
            value={badge}
            onChange={(e) => setBadge(e.target.value as PremiereBadge)}
          >
            <option value="wire_pick">Wire pick</option>
            <option value="hot">Hot</option>
            <option value="new">New</option>
          </select>
          <ul className="space-y-2 max-h-56 overflow-y-auto">
            {results.map(({ profile, track }) => (
              <li
                key={track.id}
                className="flex items-center justify-between gap-2 border border-border p-2"
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate">{track.title}</p>
                  <p className="text-xs text-muted truncate">
                    {profile.displayName} · @{profile.slug}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={busy}
                  className="ios-btn ios-btn-primary !text-[10px] shrink-0"
                  onClick={() => void handlePick(track.id, profile.id)}
                >
                  Pick
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="ios-kicker mb-2">Active picks ({picks.length})</p>
          {loading && picks.length === 0 && (
            <p className="text-sm text-muted py-6 text-center border border-dashed border-border">
              Loading…
            </p>
          )}
          {!loading && picks.length === 0 && (
            <p className="text-sm text-muted py-6 text-center border border-dashed border-border">
              No editor picks — random hourly rotation only.
            </p>
          )}
          <ul className="space-y-2">
            {picks.map((pick) => (
              <li
                key={pick.id}
                className="flex items-center justify-between gap-2 border border-border p-2"
              >
                <div className="min-w-0">
                  <p className="text-xs text-mh-red uppercase tracking-widest">{pick.badge}</p>
                  <p className="text-sm font-bold truncate">{pick.trackTitle}</p>
                  <p className="text-xs text-muted truncate">
                    {pick.artistName} · @{pick.artistSlug}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={busy}
                  className="ios-btn ios-btn-ghost !text-[10px] shrink-0"
                  onClick={() => void handleRemove(pick.id)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
