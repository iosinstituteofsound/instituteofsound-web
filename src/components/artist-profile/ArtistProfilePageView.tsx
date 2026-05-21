import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { ArtistProfilePageData } from '@/lib/artist-profile/types'
import { CoverArt, formatPlayCount } from './CoverArt'
import { SocialIcons } from './SocialIcons'
import { MetalBadge } from '@/components/ui/MetalBadge'
interface ArtistProfilePageViewProps {
  data: ArtistProfilePageData
  isOwner?: boolean
}

export function ArtistProfilePageView({ data, isOwner }: ArtistProfilePageViewProps) {
  const { profile, tracks, albums, singles, videos, editorial, pickTrack } = data
  const popular = tracks.slice(0, 5)
  const latestAlbum = albums[0]

  return (
    <div className="ios-artist-profile bg-void min-h-screen">
      <header className="ios-artist-hero relative">
        <div className="absolute inset-0">
          <CoverArt src={profile.bannerUrl} alt="" size="banner" className="opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-b from-void/30 via-void/80 to-void" />
        </div>

        <div className="relative z-10 section-padding pt-28 pb-10 max-w-6xl mx-auto">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="flex flex-wrap items-end gap-6">
              <div className="ios-artist-avatar-ring shrink-0">
                <CoverArt src={profile.avatarUrl} alt={profile.displayName} size="md" />
              </div>
              <div>
                <p className="ios-kicker">Artist</p>
                <h1 className="font-display text-4xl md:text-6xl font-extrabold uppercase tracking-tight mt-1">
                  {profile.displayName}
                </h1>
                {profile.tagline && (
                  <p className="text-muted text-sm mt-2 max-w-lg">{profile.tagline}</p>
                )}
              </div>
            </div>
            {profile.logoUrl ? (
              <CoverArt
                src={profile.logoUrl}
                alt={`${profile.displayName} logo`}
                size="sm"
                className="!w-20 !h-20 rounded-none hidden md:block"
              />
            ) : (
              <div className="ios-artist-logo-placeholder hidden md:flex">◆</div>
            )}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-6">
            <div className="text-right">
              <p className="text-[10px] tracking-[0.25em] uppercase text-muted">Monthly Listeners</p>
              <p className="font-display text-2xl font-bold text-signal mt-1">
                {profile.monthlyListenersDisplay}
              </p>
            </div>
            {isOwner && !profile.published && (
              <MetalBadge variant="crimson">Draft — not public</MetalBadge>
            )}
          </div>

          <nav className="flex gap-8 mt-10 border-b border-border/80">
            <span className="ios-artist-tab ios-artist-tab-active">Overview</span>
            <span className="ios-artist-tab text-muted">About</span>
          </nav>
        </div>
      </header>

      <div className="section-padding pb-20 max-w-6xl mx-auto">
        <section className="mb-10">
          <div className="flex flex-wrap gap-2 mb-4">
            {profile.genres.map((g) => (
              <span key={g} className="ios-artist-tag">
                {g}
              </span>
            ))}
            {profile.country && (
              <span className="ios-artist-tag ios-artist-tag-muted">{profile.country}</span>
            )}
          </div>
          <SocialIcons social={profile.social} />
        </section>

        {latestAlbum && (
          <section className="mb-12 flex flex-wrap items-center gap-4">
            <CoverArt src={latestAlbum.coverUrl} alt={latestAlbum.title} size="sm" className="!w-16 !h-16" />
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-mh-red font-bold">Latest release</p>
              <p className="font-semibold mt-1">{latestAlbum.title}</p>
              {latestAlbum.releaseYear && (
                <p className="text-xs text-muted mt-0.5">
                  {new Date(latestAlbum.releaseYear, 0, 1).toLocaleString('en', {
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              )}
            </div>
          </section>
        )}

        {editorial.length > 0 && (
          <section className="mb-14">
            <h2 className="font-display text-2xl font-bold uppercase mb-6">Editorial Featured</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {editorial.map((item, i) => (
                <motion.article
                  key={item.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="ios-artist-editorial-card group"
                >
                  <div className="aspect-[16/10] overflow-hidden">
                    <CoverArt src={item.coverImageUrl} alt={item.title} size="lg" />
                  </div>
                  <div className="p-4">
                    <MetalBadge variant="crimson" className="mb-2">
                      {item.type.replace('_', ' ')}
                    </MetalBadge>
                    <h3 className="font-display font-bold uppercase leading-tight group-hover:text-mh-red transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-muted mt-2 line-clamp-2">{item.excerpt}</p>
                    <p className="text-[10px] tracking-widest uppercase text-muted mt-3">
                      {item.editorName} · Institute of Sound
                    </p>
                  </div>
                </motion.article>
              ))}
            </div>
          </section>
        )}

        <section className="grid lg:grid-cols-[1.2fr_1fr] gap-8 mb-14">
          <div>
            <h2 className="font-display text-2xl font-bold uppercase mb-4">Popular</h2>
            <ol className="space-y-1">
              {popular.length === 0 ? (
                <li className="text-sm text-muted py-8 border border-dashed border-border text-center">
                  Tracks coming soon
                </li>
              ) : (
                popular.map((track, i) => (
                  <li key={track.id}>
                    <a
                      href={track.streamUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="ios-artist-track-row group"
                    >
                      <span className="ios-artist-track-rank">{i + 1}</span>
                      <CoverArt
                        src={track.coverUrl}
                        alt={track.title}
                        size="sm"
                        className="!w-12 !h-12 shrink-0"
                      />
                      <span className="flex-1 min-w-0 font-medium truncate group-hover:text-mh-red transition-colors">
                        {track.title}
                      </span>
                      <span className="text-sm text-muted font-mono">
                        {formatPlayCount(track.playCount)}
                      </span>
                    </a>
                  </li>
                ))
              )}
            </ol>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold uppercase mb-4">Artist Pick</h2>
            <div className="ios-artist-pick-card">
              <p className="text-[10px] tracking-[0.2em] uppercase text-muted mb-3">
                Posted by {profile.displayName}
              </p>
              {pickTrack ? (
                <>
                  <div className="rounded overflow-hidden mb-4">
                    <CoverArt src={pickTrack.coverUrl} alt={pickTrack.title} size="pick" />
                  </div>
                  <a
                    href={pickTrack.streamUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 group"
                  >
                    <CoverArt
                      src={pickTrack.coverUrl}
                      alt=""
                      size="sm"
                      className="!w-14 !h-14"
                    />
                    <span className="font-bold uppercase group-hover:text-mh-red transition-colors">
                      {pickTrack.title}
                    </span>
                  </a>
                </>
              ) : (
                <div className="ios-artist-pick-empty">
                  <CoverArt alt="Pick" size="pick" />
                  <p className="text-sm text-muted mt-4 text-center">Artist pick not set</p>
                </div>
              )}
            </div>
          </div>
        </section>

        <DiscographySection title="Albums" items={albums} />
        <DiscographySection title="Singles and EPs" items={singles} className="mt-12" />
        <VideosSection videos={videos} className="mt-12" />

        {profile.bio && (
          <section className="mt-14 ios-panel max-w-3xl">
            <p className="ios-kicker">About</p>
            <p className="text-signal/90 leading-relaxed mt-4 whitespace-pre-wrap">{profile.bio}</p>
          </section>
        )}

        <Link
          to="/discover"
          className="inline-block mt-12 text-xs tracking-widest uppercase text-muted hover:text-mh-red"
        >
          ← Discover artists
        </Link>
      </div>
    </div>
  )
}

function DiscographySection({
  title,
  items,
  className,
}: {
  title: string
  items: { id: string; title: string; coverUrl?: string; releaseYear?: number }[]
  className?: string
}) {
  if (items.length === 0) return null
  return (
    <section className={className}>
      <h2 className="font-display text-2xl font-bold uppercase mb-6">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map((item) => (
          <article key={item.id} className="ios-artist-disc-card group">
            <CoverArt src={item.coverUrl} alt={item.title} size="lg" className="mb-3" />
            <h3 className="font-semibold text-sm truncate group-hover:text-mh-red transition-colors">
              {item.title}
            </h3>
            {item.releaseYear && <p className="text-xs text-muted mt-0.5">{item.releaseYear}</p>}
          </article>
        ))}
      </div>
    </section>
  )
}

function VideosSection({
  videos,
  className,
}: {
  videos: { id: string; title: string; videoUrl: string; thumbnailUrl?: string }[]
  className?: string
}) {
  if (videos.length === 0) return null
  return (
    <section className={className}>
      <h2 className="font-display text-2xl font-bold uppercase mb-6">Videos</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((v) => (
          <a
            key={v.id}
            href={v.videoUrl}
            target="_blank"
            rel="noreferrer"
            className="ios-artist-video-card group"
          >
            <div className="aspect-video overflow-hidden relative">
              <CoverArt src={v.thumbnailUrl} alt={v.title} size="lg" />
              <span className="ios-artist-play-fab" aria-hidden>
                ▶
              </span>
            </div>
            <p className="font-semibold text-sm mt-3 group-hover:text-mh-red transition-colors">
              {v.title}
            </p>
          </a>
        ))}
      </div>
    </section>
  )
}
