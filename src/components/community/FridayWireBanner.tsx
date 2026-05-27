import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { useFridayWire } from '@/hooks/useFridayWire'
import { formatWireCountdown } from '@/lib/community/wireEvents'
import { networkProfilePath } from '@/lib/community/networkPaths'
import { parseSpotifyUrl, parseYouTubeUrl } from '@/lib/community/musicLinks'
import { IOSImage } from '@/components/ui/IOSImage'

interface FridayWireBannerProps {
  className?: string
}

export function FridayWireBanner({ className }: FridayWireBannerProps) {
  const { wire, loading, countdownMs } = useFridayWire()

  if (loading && !wire) {
    return (
      <div className={clsx('friday-wire ios-card friday-wire-loading', className)}>
        <p className="text-sm text-muted">Tuning Friday wire…</p>
      </div>
    )
  }

  const countdown = formatWireCountdown(countdownMs)
  const profilePath = wire ? networkProfilePath(wire.handle) : '/community'

  return (
    <section className={clsx('friday-wire ios-card', className)} aria-labelledby="friday-wire-heading">
      <div className="friday-wire-head">
        <div>
          <p className="ios-kicker" id="friday-wire-heading">
            Friday wire
            {wire?.wireLive && <span className="friday-wire-live"> · LIVE</span>}
          </p>
          <p className="font-display text-lg font-bold mt-1">
            {wire?.trackTitle ?? 'Next transmission slot'}
          </p>
        </div>
        <div className="friday-wire-countdown" title="Next Friday 00:00 UTC">
          <span className="friday-wire-countdown-label">Next wire</span>
          <strong>{wire?.wireLive ? 'Tonight' : countdown}</strong>
        </div>
      </div>

      {wire ? (
        <div className="friday-wire-body">
          <Link to={profilePath} className="friday-wire-author">
            {wire.avatarUrl ? (
              <IOSImage src={wire.avatarUrl} alt="" width={40} className="friday-wire-avatar" />
            ) : (
              <span className="friday-wire-avatar-fallback">{wire.displayName.charAt(0)}</span>
            )}
            <span>
              <strong>{wire.displayName}</strong>
              <span className="friday-wire-handle">{wire.handle}</span>
            </span>
          </Link>
          {(wire.spotifyUrl || wire.youtubeUrl) && (
            <div className="friday-wire-embed">
              {wire.spotifyUrl && parseSpotifyUrl(wire.spotifyUrl)?.embedUrl && (
                <iframe
                  title="Friday wire Spotify"
                  src={parseSpotifyUrl(wire.spotifyUrl)!.embedUrl}
                  loading="lazy"
                  allow="encrypted-media"
                />
              )}
              {!wire.spotifyUrl && wire.youtubeUrl && parseYouTubeUrl(wire.youtubeUrl)?.embedUrl && (
                <iframe
                  title="Friday wire YouTube"
                  src={parseYouTubeUrl(wire.youtubeUrl)!.embedUrl}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              )}
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted mt-3">
          Post a spin on Friday UTC — highest reactions get pinned on the wire until next week.
        </p>
      )}

      <Link to="/community#feed" className="friday-wire-cta">
        Join the wire →
      </Link>
    </section>
  )
}
