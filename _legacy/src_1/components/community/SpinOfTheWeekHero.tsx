import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { useSpinOfTheWeek } from '@/hooks/useSpinOfTheWeek'
import { networkProfilePath } from '@/lib/community/networkPaths'
import { getEmbedForPost } from '@/lib/community/feedService'
import { parseSpotifyUrl, parseYouTubeUrl } from '@/lib/community/musicLinks'
import { CommunityFeedReactions } from '@/components/community/CommunityFeedReactions'
import { IOSImage } from '@/components/ui/IOSImage'

interface SpinOfTheWeekHeroProps {
  variant?: 'hero' | 'rail'
  className?: string
}

export function SpinOfTheWeekHero({ variant = 'hero', className }: SpinOfTheWeekHeroProps) {
  const { spin, loading, refresh } = useSpinOfTheWeek()
  const isRail = variant === 'rail'

  if (loading && !spin) {
    return (
      <div
        className={clsx(
          'spin-of-week',
          isRail && 'spin-of-week-rail',
          'spin-of-week-loading',
          className
        )}
        aria-hidden
      >
        <p className="text-sm text-muted">{isRail ? 'Loading wire pick…' : 'Tuning the signal…'}</p>
      </div>
    )
  }

  if (!spin) {
    if (isRail) return null
    return (
      <div className={clsx('spin-of-week spin-of-week-empty ios-card', className)}>
        <p className="ios-kicker">Spin of the Week</p>
        <p className="font-display text-lg font-bold mt-1">No crowned spin yet</p>
        <p className="text-sm text-muted mt-2">
          Post a spin and get reactions this week — the wire crowns the loudest signal.
        </p>
        <Link to="/community#feed" className="spin-of-week-cta">
          Spin a track →
        </Link>
      </div>
    )
  }

  const profilePath = networkProfilePath(spin.handle)
  const spotify = spin.spotifyUrl ? parseSpotifyUrl(spin.spotifyUrl) : null
  const youtube = spin.youtubeUrl ? parseYouTubeUrl(spin.youtubeUrl) : null
  const fallback = getEmbedForPost(spin)
  const reactions = spin.reactions ?? { fire: 0, headphones: 0, bolt: 0 }
  const totalReactions = reactions.fire + reactions.headphones + reactions.bolt

  return (
    <section
      className={clsx('spin-of-week ios-card', isRail && 'spin-of-week-rail', className)}
      aria-labelledby={isRail ? 'spin-of-week-rail-heading' : 'spin-of-week-heading'}
    >
      <div className="spin-of-week-head">
        <div>
          <p className="ios-kicker" id={isRail ? 'spin-of-week-rail-heading' : 'spin-of-week-heading'}>
            Spin of the Week
          </p>
          <p className="font-display text-xl font-bold mt-1">
            {spin.trackTitle ?? 'Untitled transmission'}
          </p>
        </div>
        <p className="spin-of-week-score" title="Total reactions this week">
          {totalReactions.toLocaleString()} reactions
        </p>
      </div>

      <div className={clsx('spin-of-week-body', isRail && 'spin-of-week-body-rail')}>
        <Link to={profilePath} className="spin-of-week-author">
          <div className="spin-of-week-avatar">
            {spin.avatarUrl ? (
              <IOSImage src={spin.avatarUrl} alt="" width={40} className="w-full h-full object-cover" />
            ) : (
              <span aria-hidden>{spin.displayName.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div>
            <p className="spin-of-week-name">{spin.displayName}</p>
            <p className="spin-of-week-handle">{spin.handle}</p>
          </div>
        </Link>

        {!isRail && spin.body && <p className="spin-of-week-caption">{spin.body}</p>}

        <div className="spin-of-week-embeds community-feed-embeds">
          {spotify && (
            <iframe
              title="Spotify embed"
              src={spotify.embedUrl}
              className="community-feed-embed community-feed-embed-spotify"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
            />
          )}
          {youtube && (
            <iframe
              title="YouTube embed"
              src={youtube.embedUrl}
              className="community-feed-embed community-feed-embed-youtube"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          )}
          {!spotify && !youtube && fallback && (
            <a
              href={fallback.url}
              target="_blank"
              rel="noreferrer noopener"
              className="community-feed-link-fallback"
            >
              Open {fallback.label} →
            </a>
          )}
        </div>

        {!isRail && (
          <CommunityFeedReactions post={spin} onChange={() => void refresh()} />
        )}
      </div>

      <Link to="/community" className="spin-of-week-more">
        Full network feed →
      </Link>
    </section>
  )
}
