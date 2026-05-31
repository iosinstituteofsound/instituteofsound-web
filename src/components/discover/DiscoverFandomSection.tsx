import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { fetchFandomDiscover } from '@/lib/fandom/service'
import type { FandomDiscoverArtistRow } from '@/lib/fandom/types'
import { LoadingTransmission } from '@/components/ui/LoadingTransmission'
import { IOSImage } from '@/components/ui/IOSImage'

function ArtistDiscoverCard({ row }: { row: FandomDiscoverArtistRow }) {
  return (
    <Link
      to={`/artists/${row.slug}`}
      className="discover-fandom-card ios-card p-4 flex items-center gap-3 hover:border-mh-red/30 transition-colors"
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
        <div className="w-12 h-12 rounded-full bg-border shrink-0" aria-hidden />
      )}
      <div className="min-w-0">
        <p className="font-bold truncate">{row.displayName}</p>
        <p className="text-xs text-mh-red mt-0.5">{row.reasonLabel}</p>
      </div>
    </Link>
  )
}

export function DiscoverFandomSection() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [rising, setRising] = useState<FandomDiscoverArtistRow[]>([])
  const [forYou, setForYou] = useState<FandomDiscoverArtistRow[]>([])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchFandomDiscover()
      setRising(data.rising)
      setForYou(data.forYou)
    } catch {
      setRising([])
      setForYou([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  if (!loading && rising.length === 0 && forYou.length === 0) {
    return null
  }

  return (
    <section id="discover-fandom" className="discover-fandom-sec scroll-mt-24 mb-12">
      <header className="mb-6">
        <p className="ios-kicker">Support graph</p>
        <h2 className="font-display text-2xl font-bold mt-1">Artists gaining momentum</h2>
        <p className="text-sm text-muted mt-2 max-w-2xl">
          Surfaced from real support on the wire — shares, tagged posts, and overlapping
          supporter circles. Not algorithmic plays or page views.
        </p>
      </header>

      {loading ? (
        <LoadingTransmission variant="compact" />
      ) : (
        <div className="space-y-8">
          {user && forYou.length > 0 && (
            <div>
              <h3 className="text-xs tracking-[0.2em] uppercase text-mh-red font-bold mb-3">
                From your fandom
              </h3>
              <ul className="grid sm:grid-cols-2 gap-3 list-none p-0 m-0">
                {forYou.map((row) => (
                  <li key={row.artistProfileId}>
                    <ArtistDiscoverCard row={row} />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {rising.length > 0 && (
            <div>
              <h3 className="text-xs tracking-[0.2em] uppercase text-muted font-bold mb-3">
                Rising on the network
              </h3>
              <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 list-none p-0 m-0">
                {rising.map((row) => (
                  <li key={row.artistProfileId}>
                    <ArtistDiscoverCard row={row} />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {user && (
            <p className="text-xs text-muted">
              <Link to="/dashboard" className="ios-link">
                Open My Fandom
              </Link>
              {' · '}
              see every artist you support
            </p>
          )}
        </div>
      )}
    </section>
  )
}
