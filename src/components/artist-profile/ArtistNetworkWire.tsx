import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { CommunityFeedPost } from '@/lib/community/feedTypes'
import { networkProfilePath } from '@/lib/community/networkPaths'
import { parseSpotifyUrl, parseYouTubeUrl } from '@/lib/community/musicLinks'
import { CommunityFeedReactions } from '@/components/community/CommunityFeedReactions'

const sectionMotion = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
}

interface ArtistNetworkWireProps {
  networkHandle: string
  latestSpin: CommunityFeedPost | null
}

export function ArtistNetworkWire({ networkHandle, latestSpin }: ArtistNetworkWireProps) {
  const profilePath = networkProfilePath(networkHandle)
  const spotify = latestSpin?.spotifyUrl ? parseSpotifyUrl(latestSpin.spotifyUrl) : null
  const youtube = latestSpin?.youtubeUrl ? parseYouTubeUrl(latestSpin.youtubeUrl) : null

  return (
    <motion.section id="network-wire" {...sectionMotion} className="artist-site-section">
      <div className="artist-network-wire ios-card">
        <div className="artist-network-wire-head">
          <div>
            <p className="artist-site-eyebrow">On the network</p>
            <h2 className="artist-site-section-title">Latest on the wire</h2>
            <p className="artist-site-section-sub">
              Follow their transmissions, spins, and dB rank on the Institute of Sound network.
            </p>
          </div>
          <Link to={profilePath} className="artist-site-btn artist-site-btn-primary">
            View network profile →
          </Link>
        </div>

        {latestSpin ? (
          <div className="artist-network-wire-spin">
            <p className="font-display font-bold">{latestSpin.trackTitle ?? 'Recent spin'}</p>
            {latestSpin.body && <p className="text-sm text-muted mt-1">{latestSpin.body}</p>}
            <div className="community-feed-embeds mt-4">
              {spotify && (
                <iframe
                  title="Spotify embed"
                  src={spotify.embedUrl}
                  className="community-feed-embed community-feed-embed-spotify"
                  loading="lazy"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                />
              )}
              {youtube && (
                <iframe
                  title="YouTube embed"
                  src={youtube.embedUrl}
                  className="community-feed-embed community-feed-embed-youtube"
                  loading="lazy"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              )}
            </div>
            <CommunityFeedReactions post={latestSpin} />
          </div>
        ) : (
          <p className="text-sm text-muted mt-4">
            No spins on the wire yet — check their profile for drops and activity.
          </p>
        )}
      </div>
    </motion.section>
  )
}
