import { Link } from 'react-router-dom'
import type { CommunityFeedPost } from '@/lib/community/feedTypes'
import { networkProfilePath } from '@/lib/community/networkPaths'
import { parseSpotifyUrl, parseYouTubeUrl } from '@/lib/community/musicLinks'
import { getEmbedForPost } from '@/lib/community/feedService'
import { CommunityFeedReactions } from '@/components/community/CommunityFeedReactions'
import { IOSImage } from '@/components/ui/IOSImage'

interface FeaturedTransmissionBlockProps {
  post: CommunityFeedPost
  onReactionChange?: () => void
}

export function FeaturedTransmissionBlock({ post, onReactionChange }: FeaturedTransmissionBlockProps) {
  const profilePath = networkProfilePath(post.handle)
  const spotify = post.spotifyUrl ? parseSpotifyUrl(post.spotifyUrl) : null
  const youtube = post.youtubeUrl ? parseYouTubeUrl(post.youtubeUrl) : null
  const fallback = getEmbedForPost(post)

  return (
    <aside className="featured-transmission ios-card" aria-labelledby="featured-transmission-heading">
      <p className="ios-kicker" id="featured-transmission-heading">
        Featured transmission
      </p>
      <p className="font-display font-bold text-lg mt-1">
        {post.trackTitle ?? 'Spin on the wire'}
      </p>
      <p className="text-sm text-muted mt-1">
        Community pick linked to this editorial — listen on the network.
      </p>

      <Link to={profilePath} className="featured-transmission-author">
        <div className="featured-transmission-avatar">
          {post.avatarUrl ? (
            <IOSImage src={post.avatarUrl} alt="" width={40} className="w-full h-full object-cover" />
          ) : (
            <span aria-hidden>{post.displayName.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <span>
          <span className="block font-medium">{post.displayName}</span>
          <span className="block text-xs text-muted">{post.handle}</span>
        </span>
      </Link>

      {post.body && <p className="featured-transmission-caption">{post.body}</p>}

      <div className="featured-transmission-embeds community-feed-embeds">
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

      <CommunityFeedReactions post={post} onChange={onReactionChange} />

      <Link to="/community#feed" className="featured-transmission-more">
        More spins on the wire →
      </Link>
    </aside>
  )
}
