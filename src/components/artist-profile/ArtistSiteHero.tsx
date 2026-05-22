import { motion } from 'framer-motion'
import type { ArtistProfile, ArtistTrack } from '@/lib/artist-profile/types'
import { getYoutubeHeroEmbedUrl } from '@/lib/artist-profile/embed'
import { CoverArt } from './CoverArt'
import { SocialIcons } from './SocialIcons'
import { MetalBadge } from '@/components/ui/MetalBadge'

interface ArtistSiteHeroProps {
  profile: ArtistProfile
  listenTrack?: ArtistTrack
  trackCount: number
  isOwner?: boolean
}

export function ArtistSiteHero({
  profile,
  listenTrack,
  trackCount,
  isOwner,
}: ArtistSiteHeroProps) {
  const primaryHref = listenTrack?.streamUrl || profile.social.spotify || profile.social.youtube
  const heroVideoEmbed = profile.heroVideoUrl
    ? getYoutubeHeroEmbedUrl(profile.heroVideoUrl)
    : null

  return (
    <header className="artist-site-hero" id="overview">
      <div className="artist-site-hero-media" aria-hidden>
        {heroVideoEmbed ? (
          <div className="artist-site-hero-video-wrap">
            <iframe
              src={heroVideoEmbed}
              title={`${profile.displayName} background video`}
              className="artist-site-hero-video-iframe"
              allow="autoplay; encrypted-media; picture-in-picture"
              tabIndex={-1}
            />
          </div>
        ) : (
          <CoverArt src={profile.bannerUrl} alt="" size="banner" className="artist-site-hero-img" />
        )}
        <div className="artist-site-hero-vignette" />
        <div className="artist-site-hero-grain" />
      </div>

      {profile.logoUrl && (
        <div className="artist-site-hero-watermark" aria-hidden>
          <CoverArt src={profile.logoUrl} alt="" size="sm" className="!w-full !h-full opacity-90" />
        </div>
      )}

      <div className="artist-site-hero-inner">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="artist-site-hero-meta"
        >
          <div className="flex flex-wrap items-center gap-3">
            {profile.genres.slice(0, 3).map((g) => (
              <span key={g} className="artist-site-pill">
                {g}
              </span>
            ))}
            {profile.country && (
              <span className="artist-site-pill artist-site-pill-muted">{profile.country}</span>
            )}
            {isOwner && !profile.published && (
              <MetalBadge variant="crimson">Draft</MetalBadge>
            )}
          </div>

          <h1 className="artist-site-hero-title">{profile.displayName}</h1>

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
          </div>

          <SocialIcons
            social={profile.social}
            socialLinkOrder={profile.socialLinkOrder}
            variant="hero"
            className="mt-6"
          />
        </motion.div>

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
      </div>

      <div className="artist-site-hero-edge" aria-hidden />
    </header>
  )
}
