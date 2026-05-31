import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { fetchArtistFandom } from '@/lib/fandom/service'
import type { FandomWindow } from '@/lib/fandom/types'
import { IOSImage } from '@/components/ui/IOSImage'
import { networkProfilePath } from '@/lib/community/networkPaths'

const ACTION_LABEL: Record<string, string> = {
  review: 'Review',
  editorial: 'Editorial',
  tagged_spin: 'Spin',
  tagged_drop: 'Drop',
  comment: 'Comment',
  reaction: 'Reaction',
  share: 'Share',
}

function normalizeArtistFandom(data: Awaited<ReturnType<typeof fetchArtistFandom>>) {
  return {
    supporters: data.supporters ?? [],
    recent: data.recent ?? [],
    champions: data.champions ?? [],
    drivers: data.drivers ?? [],
  }
}

export function ArtistFandomPanel() {
  const [fandomWindow, setFandomWindow] = useState<FandomWindow>('90d')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [supporters, setSupporters] = useState<Awaited<ReturnType<typeof fetchArtistFandom>>['supporters']>([])
  const [recent, setRecent] = useState<Awaited<ReturnType<typeof fetchArtistFandom>>['recent']>([])
  const [champions, setChampions] = useState<Awaited<ReturnType<typeof fetchArtistFandom>>['champions']>([])
  const [drivers, setDrivers] = useState<Awaited<ReturnType<typeof fetchArtistFandom>>['drivers']>([])

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = normalizeArtistFandom(await fetchArtistFandom(fandomWindow))
      setSupporters(data.supporters)
      setRecent(data.recent)
      setChampions(data.champions)
      setDrivers(data.drivers)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load fandom')
      setSupporters([])
      setRecent([])
      setChampions([])
      setDrivers([])
    } finally {
      setLoading(false)
    }
  }, [fandomWindow])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <div className="space-y-8">
      <div className="ios-card p-6 md:p-8">
        <p className="text-[10px] tracking-[0.25em] uppercase text-mh-red font-bold mb-2">Fandom</p>
        <h2 className="font-display text-2xl md:text-3xl font-bold uppercase">Who supports you</h2>
        <p className="text-sm text-muted mt-2 max-w-2xl">
          Supporters ranked by meaningful engagement — reviews, tagged posts, comments, and more.
          Exact scores stay private; public badges use ranks only.
        </p>
        <div className="flex flex-wrap gap-2 mt-6">
          {(['90d', 'all'] as const).map((w) => (
            <button
              key={w}
              type="button"
              className={clsx(
                'ios-btn !text-xs',
                fandomWindow === w ? 'ios-btn-primary' : 'ios-btn-ghost',
              )}
              onClick={() => setFandomWindow(w)}
            >
              {w === '90d' ? 'Last 90 days' : 'All-time'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted ios-card p-6" role="status">
          Loading fandom…
        </p>
      ) : error ? (
        <p className="text-sm text-mh-red">{error}</p>
      ) : (
        <>
          <section>
            <h3 className="font-display text-lg font-bold uppercase mb-3">Top supporters</h3>
            {supporters.length === 0 ? (
              <p className="text-sm text-muted ios-card p-4">No supporter activity in this window yet.</p>
            ) : (
              <ul className="space-y-2">
                {supporters.map((s) => (
                  <li key={s.supporterUserId} className="ios-card p-4 flex items-center gap-3">
                    {s.avatarUrl ? (
                      <IOSImage
                        src={s.avatarUrl}
                        alt=""
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-border" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold truncate">{s.displayName}</p>
                      <p className="text-xs text-muted">
                        #{s.supporterRank}
                        {s.badgeLabel ? ` · ${s.badgeLabel}` : ''}
                      </p>
                    </div>
                    <Link
                      to={networkProfilePath(s.handle)}
                      className="ios-btn ios-btn-ghost !text-xs shrink-0"
                    >
                      Profile
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h3 className="font-display text-lg font-bold uppercase mb-3">Recent support</h3>
            {recent.length === 0 ? (
              <p className="text-sm text-muted ios-card p-4">Nothing recent.</p>
            ) : (
              <ul className="ios-card divide-y divide-border">
                {recent.map((r, i) => (
                  <li key={`${r.supporterUserId}-${r.createdAt}-${i}`} className="px-4 py-3 flex justify-between gap-2 text-sm">
                    <span>
                      <strong>{r.displayName}</strong>
                      <span className="text-muted"> · {ACTION_LABEL[r.actionType] ?? r.actionType}</span>
                    </span>
                    <time className="text-xs text-muted shrink-0">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </time>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h3 className="font-display text-lg font-bold uppercase mb-3">Discovery drivers</h3>
            <p className="text-xs text-muted mb-3">
              Supporters who share your work and pull others into the conversation on tagged
              posts.
            </p>
            {drivers.length === 0 ? (
              <p className="text-sm text-muted ios-card p-4">No amplification signals yet.</p>
            ) : (
              <ul className="space-y-2">
                {drivers.map((d) => (
                  <li key={d.supporterUserId} className="ios-card p-4 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold">{d.displayName}</p>
                      <p className="text-xs text-muted">
                        #{d.driverRank} · {d.shares} shares · {d.wiredReach} wired reach
                      </p>
                    </div>
                    <Link
                      to={networkProfilePath(d.handle)}
                      className="ios-btn ios-btn-ghost !text-xs"
                    >
                      Profile
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h3 className="font-display text-lg font-bold uppercase mb-3">Content champions</h3>
            <p className="text-xs text-muted mb-3">Spins, drops, reviews, and editorial about you.</p>
            {champions.length === 0 ? (
              <p className="text-sm text-muted ios-card p-4">No champion content yet.</p>
            ) : (
              <ul className="space-y-2">
                {champions.map((c) => (
                  <li key={c.supporterUserId} className="ios-card p-4 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold">{c.displayName}</p>
                      <p className="text-xs text-muted">
                        {c.spins} spins · {c.drops} drops · {c.reviews} reviews · {c.editorials} editorial
                      </p>
                    </div>
                    <Link
                      to={networkProfilePath(c.handle)}
                      className="ios-btn ios-btn-ghost !text-xs"
                    >
                      Profile
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  )
}
