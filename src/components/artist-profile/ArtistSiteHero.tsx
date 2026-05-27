import { motion } from 'framer-motion'
import clsx from 'clsx'
import type { ArtistProfile, ArtistTrack } from '@/lib/artist-profile/types'
import { getYoutubeHeroEmbedUrl } from '@/lib/artist-profile/embed'
import { heroLayoutClass } from '@/lib/artist-profile/heroLayout'
import { CoverArt } from './CoverArt'
import { SocialIcons } from './SocialIcons'
import { MetalBadge } from '@/components/ui/MetalBadge'
import { IdentityCrossLinks } from '@/components/community/IdentityCrossLinks'

interface ArtistSiteHeroProps {
  profile: ArtistProfile
  listenTrack?: ArtistTrack
  trackCount: number
  isOwner?: boolean
  networkHandle?: string | null
}

export function ArtistSiteHero({
  profile,
  listenTrack,
  trackCount,
  isOwner,
  networkHandle,
}: ArtistSiteHeroProps) {
  const layout = profile.heroLayout
  const primaryHref = listenTrack?.streamUrl || profile.social.spotify || profile.social.youtube
  const heroVideoEmbed = profile.heroVideoUrl
    ? getYoutubeHeroEmbedUrl(profile.heroVideoUrl)
    : null
  const showPortrait = layout !== 'logo'
  const showWatermark = layout === 'full' && !!profile.logoUrl

  return (
    <header
      className={clsx('artist-site-hero', heroLayoutClass(layout))}
      id="overview"
    >
      <HeroBackdrop bannerUrl={profile.bannerUrl} videoEmbed={heroVideoEmbed} layout={layout} />

      {showWatermark && (
        <div className="artist-site-hero-watermark" aria-hidden>
          <CoverArt src={profile.logoUrl} alt="" size="sm" className="!w-full !h-full opacity-90" />
        </div>
      )}

      <div className="artist-site-hero-inner">
        {layout === 'logo' && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="artist-site-hero-logo-mark"
          >
            <div className="artist-site-hero-logo-ring">
              <CoverArt
                src={profile.logoUrl ?? profile.avatarUrl}
                alt={profile.displayName}
                size="hero"
                className="artist-site-hero-logo-img"
              />
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="artist-site-hero-meta"
        >
          <HeroMetaContent
            profile={profile}
            trackCount={trackCount}
            isOwner={isOwner}
            listenTrack={listenTrack}
            primaryHref={primaryHref}
            compactTitle={layout === 'logo' || layout === 'compact'}
            networkHandle={networkHandle}
          />
        </motion.div>

        {showPortrait && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="artist-site-hero-portrait-wrap"
          >
            <div className="artist-site-hero-portrait-ring">
              <CoverArt
                src={profile.avatarUrl}
                alt={profile.displayName}
                size="hero"
                className="artist-site-hero-portrait"
              />
            </div>
          </motion.div>
        )}
      </div>

      <div className="artist-site-hero-edge" aria-hidden />
    </header>
  )
}

function HeroBackdrop({
  bannerUrl,
  videoEmbed,
  layout,
}: {
  bannerUrl?: string
  videoEmbed: string | null
  layout: ArtistProfile['heroLayout']
}) {
  const dimMedia = layout === 'logo' || layout === 'compact'

  return (
    <div
      className={clsx('artist-site-hero-media', dimMedia && 'artist-site-hero-media-dim')}
      aria-hidden
    >
      {videoEmbed ? (
        <div className="artist-site-hero-video-wrap">
          <iframe
            src={videoEmbed}
            title="Background video"
            className="artist-site-hero-video-iframe"
            allow="autoplay; encrypted-media; picture-in-picture"
            tabIndex={-1}
          />
        </div>
      ) : (
        <CoverArt src={bannerUrl} alt="" size="banner" className="artist-site-hero-img" />
      )}
      <div className="artist-site-hero-vignette" />
      <div className="artist-site-hero-grain" />
    </div>
  )
}

function HeroMetaContent({
  profile,
  trackCount,
  isOwner,
  listenTrack,
  primaryHref,
  compactTitle,
  networkHandle,
}: {
  profile: ArtistProfile
  trackCount: number
  isOwner?: boolean
  listenTrack?: ArtistTrack
  primaryHref?: string
  compactTitle?: boolean
  networkHandle?: string | null
}) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        {profile.genres.slice(0, 3).map((g) => (
          <span key={g} className="artist-site-pill">
            {g}
          </span>
        ))}
        {profile.country && (
          <span className="artist-site-pill artist-site-pill-muted">{profile.country}</span>
        )}
        {isOwner && !profile.published && <MetalBadge variant="crimson">Draft</MetalBadge>}
      </div>

      <h1
        className={clsx(
          'artist-site-hero-title',
          compactTitle && 'artist-site-hero-title-compact'
        )}
      >
        {profile.displayName}
      </h1>

      {profile.tagline && (
        <p className="artist-site-hero-tagline font-serif italic">{profile.tagline}</p>
      )}

      <div className="artist-site-hero-stats">
        <div className="artist-site-stat">
          <span className="artist-site-stat-value">{profile.monthlyListenersDisplay}</span>
          <span className="artist-site-stat-label">Monthly listeners</span>
        </div>
        <div className="artist-site-stat-divider" aria-hidden />
        <div className="artist-site-stat">
          <span className="artist-site-stat-value">{trackCount}</span>
          <span className="artist-site-stat-label">Tracks</span>
        </div>
      </div>

      <div className="artist-site-hero-actions">
        {primaryHref && (
          <a
            href={primaryHref}
            target="_blank"
            rel="noreferrer"
            className="artist-site-btn artist-site-btn-primary"
          >
            {listenTrack ? `Play ${listenTrack.title}` : 'Listen now'}
          </a>
        )}
        {profile.social.website && (
          <a
            href={profile.social.website}
            target="_blank"
            rel="noreferrer"
            className="artist-site-btn artist-site-btn-ghost"
          >
            Official site
          </a>
        )}
        {profile.pressKitUrl && (
          <a
            href={profile.pressKitUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="artist-site-btn artist-site-btn-ghost"
            download
          >
            Press kit
          </a>
        )}
      </div>

      <IdentityCrossLinks
        artistSlug={profile.slug}
        networkHandle={networkHandle}
        className="mt-5"
        compact
      />

      <SocialIcons
        social={profile.social}
        socialLinkOrder={profile.socialLinkOrder}
        variant="hero"
        className="mt-6"
      />
    </>
  )
}
