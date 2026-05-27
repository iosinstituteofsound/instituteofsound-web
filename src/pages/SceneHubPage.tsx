import { Link, useParams } from 'react-router-dom'
import { useMemo } from 'react'
import { LoadingTransmission } from '@/components/ui/LoadingTransmission'
import { CommunityLeaderboard } from '@/components/community/CommunityLeaderboard'
import { CommunityFeedCard } from '@/components/community/CommunityFeedCard'
import { SceneReleaseRail } from '@/components/discovery/SceneReleaseRail'
import { useSceneHub } from '@/hooks/useSceneHub'
import { isValidSceneHub } from '@/lib/discovery/sceneRegistry'
import { useSeo } from '@/hooks/useSeo'
import { breadcrumbJsonLd } from '@/lib/seo/jsonLd'
import { IOSImage } from '@/components/ui/IOSImage'

export default function SceneHubPage() {
  const { city: citySlug = '', genre: genreSlug = '' } = useParams<{
    city: string
    genre: string
  }>()

  const valid = isValidSceneHub(citySlug, genreSlug)
  const { data, loading } = useSceneHub(citySlug, genreSlug)

  const canonicalPath = `/scenes/${citySlug}/${genreSlug}`

  const seo = useMemo(() => {
    if (!data) return null
    return {
      title: `${data.cityLabel} ${data.genreLabel}`,
      description: `Underground ${data.genreLabel} in ${data.cityLabel} — premieres, tribe board, spins, and crews on Institute of Sound.`,
      canonicalPath,
      jsonLd: breadcrumbJsonLd([
        { name: 'Home', path: '/' },
        { name: 'Scenes', path: '/scenes' },
        { name: `${data.cityLabel} · ${data.genreLabel}`, path: canonicalPath },
      ]),
    }
  }, [data, canonicalPath])

  useSeo(seo)

  if (!valid) {
    return (
      <div className="section-padding pt-32 text-center">
        <p className="text-crimson">Scene not found</p>
        <Link to="/scenes" className="text-neon text-sm mt-4 inline-block">
          ← All scenes
        </Link>
      </div>
    )
  }

  if (loading && !data) return <LoadingTransmission variant="hell" />

  if (!data) {
    return (
      <div className="section-padding pt-32 text-center">
        <p className="text-muted">Could not load this scene.</p>
        <Link to="/scenes" className="text-neon text-sm mt-4 inline-block">
          ← All scenes
        </Link>
      </div>
    )
  }

  return (
    <div className="scene-hub section-padding pt-28 pb-20">
      <div className="max-w-6xl mx-auto">
        <nav className="text-xs text-muted uppercase tracking-widest mb-6">
          <Link to="/scenes" className="hover:text-mh-red">
            Scenes
          </Link>
          <span className="mx-2">/</span>
          <span>{data.cityLabel}</span>
          <span className="mx-2">/</span>
          <span className="text-signal">{data.genreLabel}</span>
        </nav>

        <header className="scene-hub-hero mb-12">
          <p className="ios-kicker">Scene hub · India</p>
          <h1 className="font-display text-4xl md:text-6xl font-extrabold uppercase mt-2 leading-tight">
            {data.cityLabel} {data.genreLabel}
          </h1>
          <p className="text-sm text-muted mt-4 max-w-2xl">{data.rankingNote}</p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Link to="/community#feed" className="ios-btn ios-btn-primary !text-xs">
              Network feed →
            </Link>
            <Link to="/community#genre-board" className="ios-btn ios-btn-ghost !text-xs">
              Tribe board →
            </Link>
          </div>
        </header>

        {data.editorialPick && (
          <section className="scene-hub-editorial ios-card mb-10" aria-labelledby="scene-editorial">
            <p className="ios-kicker" id="scene-editorial">
              Editor path
            </p>
            <Link to={`/feature/${data.editorialPick.slug}`} className="scene-hub-editorial-link">
              {data.editorialPick.coverImageUrl && (
                <IOSImage
                  src={data.editorialPick.coverImageUrl}
                  alt=""
                  width={200}
                  className="scene-hub-editorial-art"
                />
              )}
              <div>
                <p className="font-display text-xl font-bold">{data.editorialPick.title}</p>
                <p className="text-sm text-mh-red mt-2">Read on IOS desk →</p>
              </div>
            </Link>
          </section>
        )}

        <section className="mb-12" aria-labelledby="scene-premieres">
          <h2 id="scene-premieres" className="font-display text-2xl font-bold mb-4">
            Premieres in this scene
          </h2>
          <SceneReleaseRail releases={data.releases} />
        </section>

        <div className="scene-hub-grid">
          <section aria-labelledby="scene-tribe-board">
            <h2 id="scene-tribe-board" className="font-display text-2xl font-bold mb-2">
              Tribe board this week
            </h2>
            <p className="text-sm text-muted mb-4">
              Top earners in {data.genreLabel} — resets every 7 days
            </p>
            <CommunityLeaderboard entries={data.tribeLeaderboard} compact />
          </section>

          <section aria-labelledby="scene-spins">
            <h2 id="scene-spins" className="font-display text-2xl font-bold mb-4">
              Recent spins
            </h2>
            <div className="space-y-4">
              {data.recentSpins.length === 0 ? (
                <p className="text-sm text-muted">No spins from this tribe yet this week.</p>
              ) : (
                data.recentSpins.map((post) => (
                  <CommunityFeedCard key={post.id} post={post} />
                ))
              )}
            </div>
          </section>
        </div>

        {data.crews.length > 0 && (
          <section className="mt-12" aria-labelledby="scene-crews">
            <h2 id="scene-crews" className="font-display text-2xl font-bold mb-4">
              Crews in the wire
            </h2>
            <ol className="scene-hub-crews">
              {data.crews.slice(0, 5).map((c, i) => (
                <li key={c.crewId} className="scene-hub-crew-row ios-card">
                  <span className="text-mh-red font-bold">{i + 1}</span>
                  <div>
                    <p className="font-display font-bold">{c.name}</p>
                    <p className="text-xs text-muted">{c.weeklyDb.toLocaleString()} dB this week</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>
    </div>
  )
}
