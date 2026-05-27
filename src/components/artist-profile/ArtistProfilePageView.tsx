import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { ArtistAlbum, ArtistProfilePageData, ArtistTrack, ArtistVideo } from '@/lib/artist-profile/types'
import { CoverArt } from './CoverArt'
import { ArtistPickPlayer } from './ArtistPickPlayer'
import { TrackListWithPlayers } from './TrackListWithPlayers'
import { ArtistLineupSection } from './ArtistLineupSection'
import { ArtistStorySection, hasArtistStory } from './ArtistStorySection'
import { ArtistMerchSection } from './ArtistMerchSection'
import { ArtistPressKitSection } from './ArtistPressKitSection'
import { ArtistSiteHero } from './ArtistSiteHero'
import { ArtistSiteStickyNav, type ArtistSiteNavItem } from './ArtistSiteStickyNav'
import { MetalBadge } from '@/components/ui/MetalBadge'
import { EditorByline } from '@/components/editor/EditorByline'
import { editorialTypeLabel } from '@/lib/editorial/labels'
import { artistBrandingStyle, artistSiteThemeClass } from '@/lib/artist-profile/branding'

interface ArtistProfilePageViewProps {
  data: ArtistProfilePageData
  isOwner?: boolean
  viewerUserId?: string
  networkHandle?: string | null
}

const sectionMotion = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
}

export function ArtistProfilePageView({
  data,
  isOwner,
  viewerUserId,
  networkHandle,
}: ArtistProfilePageViewProps) {
  const { profile, tracks, albums, singles, videos, merch, lineup, bioTimeline, editorial, pickTrack } =
    data
  const analyticsCtx = {
    profileId: profile.id,
    published: profile.published,
    viewerUserId,
    ownerUserId: profile.userId,
  }
  const listenTrack = pickTrack ?? tracks[0]
  const latestAlbum = albums[0]
  const latestSingle = singles[0]

  const navItems: ArtistSiteNavItem[] = [
    { id: 'overview', label: 'Overview' },
    ...(tracks.length > 0 ? [{ id: 'music', label: 'Music' }] : []),
    ...(albums.length > 0 || singles.length > 0
      ? [{ id: 'releases', label: 'Releases' }]
      : []),
    ...(videos.length > 0 ? [{ id: 'videos', label: 'Videos' }] : []),
    ...(merch.length > 0 ? [{ id: 'merch', label: 'Merch' }] : []),
    ...(profile.pressKitUrl ? [{ id: 'press-kit', label: 'Press kit' }] : []),
    ...(lineup.length > 0 ? [{ id: 'lineup', label: 'Lineup' }] : []),
    ...(hasArtistStory(profile, bioTimeline) ? [{ id: 'about', label: 'Story' }] : []),
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
        networkHandle={networkHandle}
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
              subtitle="Press ▶ to open the player. Spotify, YouTube, and SoundCloud supported."
            />
            <div className="artist-site-music-grid">
              <div className="artist-site-track-panel">
                <TrackListWithPlayers tracks={tracks} {...analyticsCtx} />
              </div>
              <aside className="artist-site-pick-panel">
                <ArtistPickCard
                  profileName={profile.displayName}
                  track={pickTrack ?? tracks[0]}
                  analytics={analyticsCtx}
                />
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

        <ArtistMerchSection items={merch} />

        <ArtistPressKitSection profile={profile} />

        <ArtistLineupSection entries={lineup} />

        <ArtistStorySection profile={profile} bioTimeline={bioTimeline} />

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
                    <MetalBadge variant="crimson">{editorialTypeLabel(item.type)}</MetalBadge>
                    <h3>{item.title}</h3>
                    <p>{item.excerpt}</p>
                    <p className="artist-site-press-byline">
                      <EditorByline
                        name={item.editorName}
                        username={item.editorUsername}
                      />
                      <span className="text-muted"> · Institute of Sound</span>
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

function ArtistPickCard({
  profileName,
  track,
  analytics,
}: {
  profileName: string
  track?: ArtistTrack
  analytics: {
    profileId: string
    published: boolean
    viewerUserId?: string
    ownerUserId: string
  }
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

  return <ArtistPickPlayer profileName={profileName} track={track} {...analytics} />
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
