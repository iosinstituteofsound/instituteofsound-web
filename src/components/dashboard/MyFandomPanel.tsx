import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { fetchMyFandom } from '@/lib/fandom/service'
import type { FandomWindow, MyFandomArtistRow } from '@/lib/fandom/types'
import { LoadingTransmission } from '@/components/ui/LoadingTransmission'
import { IOSImage } from '@/components/ui/IOSImage'

export function MyFandomPanel() {
  const [fandomWindow, setFandomWindow] = useState<FandomWindow>('90d')
  const [artists, setArtists] = useState<MyFandomArtistRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const rows = await fetchMyFandom(fandomWindow)
      setArtists(rows ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load fandom')
      setArtists([])
    } finally {
      setLoading(false)
    }
  }, [fandomWindow])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <div className="space-y-6">
      <div className="ios-card p-6 md:p-8">
        <p className="text-[10px] tracking-[0.25em] uppercase text-mh-red font-bold mb-2">My Fandom</p>
        <h2 className="font-display text-2xl md:text-3xl font-bold uppercase">Artists you support</h2>
        <p className="text-sm text-muted mt-2 max-w-2xl">
          Your relationship with artists on the network — ranked by meaningful support, not points
          farming.
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
        <LoadingTransmission variant="compact" />
      ) : error ? (
        <p className="text-sm text-mh-red">{error}</p>
      ) : artists.length === 0 ? (
        <div className="ios-card p-6 border-dashed border-border text-sm text-muted">
          <p>No support relationships yet. Spin, drop, react, or tag artists on the feed.</p>
          <Link to="/community#feed" className="ios-link text-xs mt-4 inline-block">
            Open network feed →
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {artists.map((row) => {
            const open = expandedId === row.artistProfileId
            return (
              <li key={row.artistProfileId} className="ios-card overflow-hidden">
                <button
                  type="button"
                  className="w-full flex items-center gap-4 p-4 text-left hover:bg-paper/50"
                  onClick={() =>
                    setExpandedId(open ? null : row.artistProfileId)
                  }
                >
                  {row.avatarUrl ? (
                    <IOSImage
                      src={row.avatarUrl}
                      alt=""
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-border shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold uppercase truncate">{row.displayName}</p>
                    <p className="text-xs text-muted">
                      #{row.rankAmongMyArtists} in your list
                      {row.percentileLabel ? ` · ${row.percentileLabel}` : ''}
                    </p>
                  </div>
                  <Link
                    to={`/artist/${row.slug}`}
                    className="ios-btn ios-btn-ghost !text-xs shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Page
                  </Link>
                </button>
                {open && (
                  <div className="px-4 pb-4 pt-0 border-t border-border text-sm">
                    <p className="text-xs text-muted mb-3 mt-3">
                      You are one of this artist&apos;s active supporters in your network.
                    </p>
                    <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        ['Spins', row.spins],
                        ['Drops', row.drops],
                        ['Comments', row.comments],
                        ['Reactions', row.reactions],
                        ['Shares', row.shares],
                        ['Reviews', row.reviews],
                        ['Editorial', row.editorials],
                      ].map(([label, n]) => (
                        <div key={label}>
                          <dt className="text-[10px] uppercase tracking-wider text-muted">{label}</dt>
                          <dd className="font-display text-lg font-bold">{n}</dd>
                        </div>
                      ))}
                    </dl>
                    {row.firstSupportAt && (
                      <p className="text-xs text-muted mt-3">
                        First support {new Date(row.firstSupportAt).toLocaleDateString()}
                        {row.lastSupportAt &&
                          ` · Last activity ${new Date(row.lastSupportAt).toLocaleDateString()}`}
                      </p>
                    )}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
