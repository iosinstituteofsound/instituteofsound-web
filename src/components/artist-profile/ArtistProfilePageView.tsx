import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { ArtistAlbum, ArtistProfilePageData, ArtistTrack, ArtistVideo } from '@/lib/artist-profile/types'
import {
  STREAM_PLATFORM_LABEL,
  streamPlatform,
} from '@/lib/artist-profile/streamPlatform'
import { CoverArt, formatPlayCount } from './CoverArt'
import { ArtistStreamEmbed } from './ArtistStreamEmbed'
import { ArtistSiteHero } from './ArtistSiteHero'
import { getStreamEmbed } from '@/lib/artist-profile/embed'
import { ArtistSiteStickyNav, type ArtistSiteNavItem } from './ArtistSiteStickyNav'
import { MetalBadge } from '@/components/ui/MetalBadge'
import { artistBrandingStyle, artistSiteThemeClass } from '@/lib/artist-profile/branding'

interface ArtistProfilePageViewProps {
  data: ArtistProfilePageData
  isOwner?: boolean
}

const sectionMotion = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
}

export function ArtistProfilePageView({ data, isOwner }: ArtistProfilePageViewProps) {
  const { profile, tracks, albums, singles, videos, editorial, pickTrack } = data
  const listenTrack = pickTrack ?? tracks[0]
  const featuredEmbed = listenTrack ? getStreamEmbed(listenTrack.streamUrl, listenTrack.title) : null
  const latestAlbum = albums[0]
  const latestSingle = singles[0]

  const navItems: ArtistSiteNavItem[] = [
    { id: 'overview', label: 'Overview' },
    ...(tracks.length > 0 ? [{ id: 'music', label: 'Music' }] : []),
    ...(albums.length > 0 || singles.length > 0
      ? [{ id: 'releases', label: 'Releases' }]
      : []),
    ...(videos.length > 0 ? [{ id: 'videos', label: 'Videos' }] : []),
    ...(profile.bio ? [{ id: 'about', label: 'Story' }] : []),
    ...(editorial.length > 0 ? [{ id: 'press', label: 'Press' }] : []),
  ]

  const siteStyle = artistBrandingStyle(profile.accentColor, profile.themePreset)

  return (
    <div
      className={`artist-site ${artistSiteThemeClass(profile.themePreset)}`}
      style={siteStyle}
    >
      <ArtistSiteHero
        profile={profile}
        listenTrack={listenTrack}
        trackCount={tracks.length}
        isOwner={isOwner}
      />

      <ArtistSiteStickyNav items={navItems} artistName={profile.displayName} />

      <div className="artist-site-body">
        {(latestAlbum || latestSingle) && (
          <motion.section
            {...sectionMotion}
            className="artist-site-featured-release"
            aria-labelledby="featured-release"
          >
            <p id="featured-release" className="artist-site-eyebrow">
              Latest release
            </p>
            <FeaturedRelease item={latestAlbum ?? latestSingle!} />
          </motion.section>
        )}

        {tracks.length > 0 && (
          <motion.section id="music" {...sectionMotion} className="artist-site-section">
            <SectionHeader
              title="Music"
              subtitle={
                featuredEmbed
                  ? 'Play here — or open any track on your platform of choice.'
                  : 'Stream the catalog — every link opens on the artist’s platform.'
              }
            />
            {listenTrack && featuredEmbed && (
              <ArtistStreamEmbed
                streamUrl={listenTrack.streamUrl}
                title={listenTrack.title}
                className="mb-8"
              />
            )}
            <div className="artist-site-music-grid">
              <div className="artist-site-track-panel">
                <TrackList tracks={tracks} />
              </div>
              <aside className="artist-site-pick-panel">
                <ArtistPickCard profileName={profile.displayName} track={pickTrack ?? tracks[0]} />
              </aside>
            </div>
          </motion.section>
        )}

        {(albums.length > 0 || singles.length > 0) && (
          <motion.section id="releases" {...sectionMotion} className="artist-site-section">
            <DiscographyCarousel title="Albums" items={albums} />
            {singles.length > 0 && (
              <DiscographyCarousel title="Singles & EPs" items={singles} className="mt-14" />
            )}
          </motion.section>
        )}

        {videos.length > 0 && (
          <motion.section id="videos" {...sectionMotion} className="artist-site-section">
            <SectionHeader title="Videos" subtitle="Visual transmissions." />
            <VideoGallery videos={videos} />
          </motion.section>
        )}

        {profile.bio && (
          <motion.section id="about" {...sectionMotion} className="artist-site-section">
            <div className="artist-site-story">
              <p className="artist-site-eyebrow">The story</p>
              {profile.tagline && (
                <blockquote className="artist-site-story-quote font-serif">
                  {profile.tagline}
                </blockquote>
              )}
              <div className="artist-site-story-body">
                <p className="whitespace-pre-wrap">{profile.bio}</p>
              </div>
            </div>
          </motion.section>
        )}

        {editorial.length > 0 && (
          <motion.section id="press" {...sectionMotion} className="artist-site-section">
            <SectionHeader title="Press & editorial" subtitle="Institute of Sound features." />
            <div className="artist-site-press-grid">
              {editorial.map((item, i) => (
                <motion.article
                  key={item.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06, duration: 0.5 }}
                  className="artist-site-press-card"
                >
                  <div className="artist-site-press-media">
                    <CoverArt src={item.coverImageUrl} alt={item.title} size="lg" />
                  </div>
                  <div className="artist-site-press-copy">
                    <MetalBadge variant="crimson">{item.type.replace('_', ' ')}</MetalBadge>
                    <h3>{item.title}</h3>
                    <p>{item.excerpt}</p>
                    <p className="artist-site-press-byline">
                      {item.editorName} · Institute of Sound
                    </p>
                  </div>
                </motion.article>
              ))}
            </div>
          </motion.section>
        )}
      </div>

      <footer className="artist-site-footer">
        <div className="artist-site-footer-inner">
          <div>
            <p className="artist-site-footer-name">{profile.displayName}</p>
            <p className="artist-site-footer-meta">
              Official artist archive on{' '}
              <Link to="/" className="artist-site-footer-link">
                Institute of Sound
              </Link>
            </p>
          </div>
          <Link to="/discover" className="artist-site-footer-discover">
            Explore more artists →
          </Link>
        </div>
      </footer>
    </div>
  )
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="artist-site-section-head">
      <h2 className="artist-site-section-title">{title}</h2>
      {subtitle && <p className="artist-site-section-sub">{subtitle}</p>}
    </header>
  )
}

function FeaturedRelease({
  item,
}: {
  item: { title: string; coverUrl?: string; releaseYear?: number; releaseType?: string }
}) {
  return (
    <article className="artist-site-release-hero">
      <div className="artist-site-release-art">
        <CoverArt src={item.coverUrl} alt={item.title} size="lg" />
      </div>
      <div className="artist-site-release-info">
        <h3>{item.title}</h3>
        {item.releaseYear && (
          <p className="artist-site-release-year">
            {new Date(item.releaseYear, 0, 1).toLocaleString('en', {
              month: 'long',
              year: 'numeric',
            })}
          </p>
        )}
        {item.releaseType && (
          <span className="artist-site-pill artist-site-pill-muted mt-4 inline-flex">
            {item.releaseType}
          </span>
        )}
      </div>
    </article>
  )
}

function TrackList({ tracks }: { tracks: ArtistTrack[] }) {
  return (
    <ol className="artist-site-track-list">
      {tracks.map((track, i) => {
        const platform = streamPlatform(track.streamUrl)
        return (
          <li key={track.id}>
            <a
              href={track.streamUrl}
              target="_blank"
              rel="noreferrer"
              className="artist-site-track"
            >
              <span className="artist-site-track-index">{String(i + 1).padStart(2, '0')}</span>
              <CoverArt
                src={track.coverUrl}
                alt=""
                size="sm"
                className="artist-site-track-thumb"
              />
              <span className="artist-site-track-main">
                <span className="artist-site-track-title">{track.title}</span>
                <span className="artist-site-track-platform">
                  {STREAM_PLATFORM_LABEL[platform]}
                </span>
              </span>
              <span className="artist-site-track-plays">{formatPlayCount(track.playCount)}</span>
              <span className="artist-site-track-play" aria-hidden>
                ▶
              </span>
            </a>
          </li>
        )
      })}
    </ol>
  )
}

function ArtistPickCard({
  profileName,
  track,
}: {
  profileName: string
  track?: ArtistTrack
}) {
  if (!track) {
    return (
      <div className="artist-site-pick">
        <p className="artist-site-eyebrow">Artist pick</p>
        <CoverArt alt="Pick" size="pick" className="artist-site-pick-art" />
        <p className="text-sm text-muted mt-4">No pick set yet.</p>
      </div>
    )
  }

  return (
    <div className="artist-site-pick">
      <p className="artist-site-eyebrow">Artist pick</p>
      <p className="artist-site-pick-by">Curated by {profileName}</p>
      <a
        href={track.streamUrl}
        target="_blank"
        rel="noreferrer"
        className="artist-site-pick-link group"
      >
        <div className="artist-site-pick-visual">
          <CoverArt src={track.coverUrl} alt={track.title} size="pick" />
          <span className="artist-site-pick-play" aria-hidden>
            ▶
          </span>
        </div>
        <h3 className="artist-site-pick-title">{track.title}</h3>
        <span className="artist-site-pick-cta">Play on {STREAM_PLATFORM_LABEL[streamPlatform(track.streamUrl)]} →</span>
      </a>
    </div>
  )
}

function DiscographyCarousel({
  title,
  items,
  className,
}: {
  title: string
  items: ArtistAlbum[]
  className?: string
}) {
  if (items.length === 0) return null
  return (
    <div className={className}>
      <SectionHeader title={title} />
      <div className="artist-site-carousel" role="list">
        {items.map((item) => (
          <article key={item.id} role="listitem" className="artist-site-disc">
            <div className="artist-site-disc-art">
              <CoverArt src={item.coverUrl} alt={item.title} size="lg" />
            </div>
            <h3>{item.title}</h3>
            {item.releaseYear && <p>{item.releaseYear}</p>}
          </article>
        ))}
      </div>
    </div>
  )
}

function VideoGallery({ videos }: { videos: ArtistVideo[] }) {
  const [lead, ...rest] = videos
  return (
    <div className="artist-site-video-grid">
      <a
        href={lead.videoUrl}
        target="_blank"
        rel="noreferrer"
        className="artist-site-video artist-site-video-lead group"
      >
        <div className="artist-site-video-media">
          <CoverArt src={lead.thumbnailUrl} alt={lead.title} size="lg" />
          <span className="artist-site-video-play" aria-hidden>
            ▶
          </span>
        </div>
        <h3>{lead.title}</h3>
      </a>
      {rest.length > 0 && (
        <div className="artist-site-video-stack">
          {rest.map((v) => (
            <a
              key={v.id}
              href={v.videoUrl}
              target="_blank"
              rel="noreferrer"
              className="artist-site-video group"
            >
              <div className="artist-site-video-media">
                <CoverArt src={v.thumbnailUrl} alt={v.title} size="lg" />
                <span className="artist-site-video-play" aria-hidden>
                  ▶
                </span>
              </div>
              <h3>{v.title}</h3>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
