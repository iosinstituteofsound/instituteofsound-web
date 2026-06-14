import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listReleasesForProfile } from '@/lib/releases/service'
import type { ArtistRelease } from '@/lib/releases/types'
import { ReleaseVinylArt } from '@/components/releases/ReleaseVinylArt'
import { artistPagePath } from '@/lib/artist-profile/networkLink'

interface NetworkProfileReleasesProps {
  artistProfileId: string
  artistSlug: string
}

export function NetworkProfileReleases({ artistProfileId, artistSlug }: NetworkProfileReleasesProps) {
  const [releases, setReleases] = useState<ArtistRelease[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    void listReleasesForProfile(artistProfileId)
      .then((list) => {
        if (!cancelled) setReleases(list.filter((r) => r.status === 'live'))
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Could not load releases.')
          setReleases([])
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [artistProfileId])

  if (loading) {
    return <p className="text-sm text-muted">Loading releases…</p>
  }

  if (error) {
    return <p className="text-sm text-mh-red">{error}</p>
  }

  if (releases.length === 0) {
    return (
      <p className="member-profile-panel-empty">
        No live releases on this artist page yet.
      </p>
    )
  }

  return (
    <div className="network-profile-releases-grid">
      {releases.map((release) => (
        <Link
          key={release.id}
          to={`/release/${release.slug}`}
          className="network-profile-release-card ios-card overflow-hidden group"
        >
          <div className="aspect-square relative bg-surface">
            <ReleaseVinylArt
              coverUrl={release.coverUrl}
              alt={release.title}
              vinylTitle={release.title}
              className="w-full h-full"
            />
          </div>
          <div className="p-4">
            <p className="text-[10px] uppercase tracking-wider text-mh-red font-bold">
              {release.releaseType}
            </p>
            <h3 className="font-display font-bold uppercase truncate group-hover:text-mh-red transition-colors">
              {release.title}
            </h3>
            {release.subtitle && (
              <p className="text-xs text-muted truncate mt-1">{release.subtitle}</p>
            )}
          </div>
        </Link>
      ))}
      <p className="text-sm text-muted col-span-full">
        <Link to={artistPagePath(artistSlug)} className="text-mh-red hover:underline">
          Open artist page →
        </Link>
      </p>
    </div>
  )
}
