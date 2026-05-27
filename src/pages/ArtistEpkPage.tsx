import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { getArtistProfilePageForViewer } from '@/lib/artist-profile/service'
import { fetchNetworkHandleForUserId } from '@/lib/artist-profile/networkLink'
import {
  fetchArtistLaunchpadSnapshot,
  type ArtistLaunchpadSnapshot,
} from '@/lib/artist-profile/launchpad'
import { networkProfilePath } from '@/lib/community/networkPaths'
import { RankBadge } from '@/components/ui/RankBadge'
import { IOSImage } from '@/components/ui/IOSImage'
import { LoadingTransmission } from '@/components/ui/LoadingTransmission'
import { SocialIcons } from '@/components/artist-profile/SocialIcons'
import type { ArtistProfilePageData } from '@/lib/artist-profile/types'

export default function ArtistEpkPage() {
  const { slug } = useParams<{ slug: string }>()
  const { user } = useAuth()
  const [data, setData] = useState<ArtistProfilePageData | null>(null)
  const [snapshot, setSnapshot] = useState<ArtistLaunchpadSnapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!slug) return
    setLoading(true)
    setError('')
    try {
      const page = await getArtistProfilePageForViewer(slug, user?.id)
      if (!page) {
        setError('Artist not found')
        setData(null)
        setSnapshot(null)
        return
      }
      setData(page)
      const handle = await fetchNetworkHandleForUserId(page.profile.userId)
      setSnapshot(await fetchArtistLaunchpadSnapshot(page.profile, handle, page.editorial))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load EPK')
    } finally {
      setLoading(false)
    }
  }, [slug, user?.id])

  useEffect(() => {
    void load()
  }, [load])

  if (loading) return <LoadingTransmission variant="hell" />
  if (error || !data) {
    return (
      <div className="section-padding pt-32 text-center">
        <p className="text-crimson">{error || 'Not found'}</p>
        <Link to="/discover" className="ios-link text-sm mt-4 inline-block">
          ← Discover
        </Link>
      </div>
    )
  }

  const { profile, tracks, merch } = data
  const ed = snapshot?.latestEditorial
  const listen = tracks[0] ?? data.pickTrack

  return (
    <div className="artist-epk-page">
      <div className="artist-epk-toolbar no-print">
        <Link to={`/artist/${profile.slug}`} className="ios-link text-xs uppercase tracking-widest">
          ← Artist page
        </Link>
        <button type="button" className="ios-btn ios-btn-primary !text-xs" onClick={() => window.print()}>
          Print / Save PDF →
        </button>
      </div>

      <article className="artist-epk-sheet">
        <header className="artist-epk-header">
          <div className="artist-epk-photo">
            {profile.avatarUrl ? (
              <IOSImage src={profile.avatarUrl} alt="" width={200} className="w-full h-full object-cover" />
            ) : (
              <span aria-hidden>{profile.displayName.charAt(0)}</span>
            )}
          </div>
          <div>
            <p className="artist-epk-kicker">Institute of Sound · Electronic press kit</p>
            <h1 className="artist-epk-title">{profile.displayName}</h1>
            {profile.tagline && <p className="artist-epk-tagline">{profile.tagline}</p>}
            {profile.genres.length > 0 && (
              <p className="artist-epk-genres">{profile.genres.join(' · ')}</p>
            )}
            {profile.country && <p className="text-sm text-muted mt-2">{profile.country}</p>}
          </div>
        </header>

        {profile.bio && (
          <section className="artist-epk-block">
            <h2>Bio</h2>
            <p className="artist-epk-bio">{profile.bio}</p>
          </section>
        )}

        {snapshot?.memberStats && (
          <section className="artist-epk-block">
            <h2>Network</h2>
            <div className="artist-epk-stats">
              <RankBadge rank={snapshot.memberStats.rank} size="md" />
              <span>{snapshot.memberStats.totalDb.toLocaleString()} dB total</span>
              <span>{snapshot.memberStats.weeklyDb.toLocaleString()} dB this week</span>
            </div>
            {snapshot.networkHandle && (
              <p className="text-sm mt-2">
                {snapshot.networkHandle} ·{' '}
                <span className="font-mono text-xs">
                  instituteofsound.in{networkProfilePath(snapshot.networkHandle)}
                </span>
              </p>
            )}
          </section>
        )}

        {snapshot && snapshot.badges.length > 0 && (
          <section className="artist-epk-block">
            <h2>Medals</h2>
            <ul className="artist-epk-badges">
              {snapshot.badges.map((b) => (
                <li key={b.slug}>
                  <strong>{b.name}</strong>
                  <span className="text-muted"> — {b.description}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {ed && (
          <section className="artist-epk-block">
            <h2>Press</h2>
            <blockquote className="artist-epk-quote">
              <p>&ldquo;{ed.excerpt}&rdquo;</p>
              <footer>
                — {ed.title}
                {ed.editorName && ` · ${ed.editorName}`}
              </footer>
            </blockquote>
            <p className="text-xs text-muted mt-2 font-mono">/feature/{ed.slug}</p>
          </section>
        )}

        <section className="artist-epk-block">
          <h2>Listen & links</h2>
          <ul className="artist-epk-links">
            {listen && (
              <li>
                <a href={listen.streamUrl} target="_blank" rel="noreferrer">
                  {listen.title} →
                </a>
              </li>
            )}
            {profile.pressKitUrl && (
              <li>
                <a href={profile.pressKitUrl} target="_blank" rel="noreferrer">
                  External press kit (PDF) →
                </a>
              </li>
            )}
            {merch.slice(0, 3).map((m) => (
              <li key={m.id}>
                <a href={m.productUrl} target="_blank" rel="noreferrer">
                  {m.title}
                  {m.showPrice && m.priceDisplay ? ` · ${m.priceDisplay}` : ''} →
                </a>
              </li>
            ))}
          </ul>
          <SocialIcons social={profile.social} socialLinkOrder={profile.socialLinkOrder} className="mt-4" />
        </section>

        <footer className="artist-epk-footer">
          <p>
            Public page:{' '}
            <span className="font-mono text-sm">instituteofsound.in/artist/{profile.slug}</span>
          </p>
          <p className="text-xs text-muted mt-2">
            Generated {new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}
          </p>
        </footer>
      </article>
    </div>
  )
}
