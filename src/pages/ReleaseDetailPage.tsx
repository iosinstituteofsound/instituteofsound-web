import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { LoadingTransmission } from '@/components/ui/LoadingTransmission'
import { IOSImage } from '@/components/ui/IOSImage'
import { ReleaseCountdown } from '@/components/releases/ReleaseCountdown'
import { ReleaseEmbed } from '@/components/releases/ReleaseEmbed'
import { ReleaseWireCta } from '@/components/releases/ReleaseWireCta'
import { RelatedSceneLink } from '@/components/releases/RelatedSceneLink'
import { fetchPublicRelease } from '@/lib/releases/public'
import { getProfileForUser } from '@/lib/artist-profile/service'
import type { PublicRelease } from '@/lib/releases/types'
import { useSeo } from '@/hooks/useSeo'
import { breadcrumbJsonLd } from '@/lib/seo/jsonLd'
import { SCENE_GENRE_SLUGS } from '@/lib/releases/constants'

export default function ReleaseDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { user } = useAuth()
  const [release, setRelease] = useState<PublicRelease | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [isOwner, setIsOwner] = useState(false)

  const load = useCallback(async () => {
    if (!slug) {
      setNotFound(true)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const data = await fetchPublicRelease(slug)
      if (!data) {
        setNotFound(true)
        setRelease(null)
      } else {
        setRelease(data)
        setNotFound(false)
      }
    } catch {
      setNotFound(true)
      setRelease(null)
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (!user || !release) {
      setIsOwner(false)
      return
    }
    void getProfileForUser(user.id).then((p) => {
      setIsOwner(Boolean(p && p.id === release.profileId))
    })
  }, [user, release])

  useEffect(() => {
    if (!release || release.isLive) return
    const id = window.setInterval(() => void load(), 15_000)
    return () => window.clearInterval(id)
  }, [release, load])

  const genreLabel = SCENE_GENRE_SLUGS.find((g) => g.slug === release?.sceneGenreSlug)?.label

  const seo = useMemo(() => {
    if (!release || !slug) return null
    return {
      title: release.title,
      description:
        release.subtitle ??
        `Premiere on Institute of Sound — ${release.artistName} · ${release.releaseType}`,
      canonicalPath: `/release/${slug}`,
      ogImage: release.coverUrl,
      ogType: 'website' as const,
      jsonLd: breadcrumbJsonLd([
        { name: 'Home', path: '/' },
        { name: 'Release', path: `/release/${slug}` },
        { name: release.title, path: `/release/${slug}` },
      ]),
    }
  }, [release, slug])

  useSeo(seo)

  if (loading) return <LoadingTransmission variant="hell" />

  if (notFound || !release) {
    return (
      <div className="section-padding pt-32 text-center">
        <p className="text-crimson font-display text-xl">Release not found</p>
        <Link to="/discover" className="text-neon text-sm mt-4 inline-block">
          ← Discover artists
        </Link>
      </div>
    )
  }

  return (
    <div className="release-page section-padding pt-28 pb-20">
      <div className="max-w-4xl mx-auto">
        <nav className="text-xs text-muted uppercase tracking-widest mb-6">
          <Link to="/" className="hover:text-mh-red">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link to={`/artist/${release.artistSlug}`} className="hover:text-mh-red">
            {release.artistName}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-signal">Premiere</span>
        </nav>

        <p className="ios-kicker">Premiere</p>
        <p className="text-xs text-muted uppercase tracking-widest mt-2">
          {release.releaseType}
          {release.sceneCity && ` · ${release.sceneCity}`}
          {genreLabel && ` · ${genreLabel}`}
        </p>

        <h1 className="font-display text-4xl md:text-6xl font-extrabold uppercase mt-3 leading-tight">
          {release.title}
        </h1>
        {release.subtitle && (
          <p className="font-serif text-xl text-signal/90 mt-4 italic">{release.subtitle}</p>
        )}

        <div className="release-page-meta mt-6 flex flex-wrap items-center gap-4">
          <Link
            to={`/artist/${release.artistSlug}`}
            className="release-page-artist flex items-center gap-3"
          >
            {release.artistAvatarUrl ? (
              <IOSImage
                src={release.artistAvatarUrl}
                alt=""
                width={48}
                className="w-12 h-12 object-cover border border-border"
              />
            ) : (
              <span className="release-page-artist-fallback">{release.artistName.charAt(0)}</span>
            )}
            <span>
              <strong>{release.artistName}</strong>
              <span className="block text-xs text-muted">View artist page</span>
            </span>
          </Link>
          {release.editorialSlug && (
            <Link
              to={`/feature/${release.editorialSlug}`}
              className="text-sm text-mh-red uppercase tracking-widest"
            >
              Editorial: {release.editorialTitle} →
            </Link>
          )}
        </div>

        <div className="release-page-grid mt-10">
          <div className="release-page-main">
            {release.coverUrl && (
              <IOSImage
                src={release.coverUrl}
                alt=""
                width={900}
                className="w-full aspect-square object-cover border border-border mb-6"
              />
            )}

            <ReleaseCountdown
              secondsUntilLive={release.secondsUntilLive}
              liveAt={release.liveAt}
              isLive={release.isLive}
            />

            <ReleaseEmbed
              spotifyUrl={release.spotifyUrl}
              youtubeUrl={release.youtubeUrl}
              soundcloudUrl={release.soundcloudUrl}
              locked={release.embedLocked}
            />

            {release.story && (
              <div className="release-page-story mt-8">
                <p className="ios-kicker">Story</p>
                <p className="text-signal/90 mt-3 whitespace-pre-wrap leading-relaxed">{release.story}</p>
              </div>
            )}

            {release.tracks.length > 0 && (
              <div className="release-page-tracklist mt-8">
                <p className="ios-kicker">Tracklist</p>
                <ol className="mt-3 space-y-2">
                  {release.tracks.map((t, i) => (
                    <li key={`${t.title}-${i}`} className="flex gap-3 text-sm border-b border-border py-2">
                      <span className="text-mh-red tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                      <span>{t.title}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {release.milestones.length > 0 && (
              <div className="release-page-timeline mt-10">
                <p className="ios-kicker">Release timeline</p>
                <ul className="mt-4 space-y-4">
                  {release.milestones.map((m) => (
                    <li key={m.id} className="border-l-2 border-mh-red pl-4">
                      <p className="text-[10px] uppercase tracking-widest text-muted">{m.kind}</p>
                      <p className="font-display font-bold">{m.title}</p>
                      {m.body && <p className="text-sm text-muted mt-1">{m.body}</p>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <aside className="release-page-aside">
            <RelatedSceneLink
              sceneCity={release.sceneCity}
              sceneGenreSlug={release.sceneGenreSlug}
            />
            <ReleaseWireCta release={release} isOwner={isOwner} />
            <div className="release-page-share ios-card mt-4">
              <p className="ios-kicker">Share</p>
              <p className="text-sm text-muted mt-2 break-all">
                instituteofsound.in/release/{release.slug}
              </p>
              <button
                type="button"
                className="ios-btn ios-btn-ghost mt-3 w-full"
                onClick={() => void navigator.clipboard?.writeText(window.location.href)}
              >
                Copy premiere link
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
