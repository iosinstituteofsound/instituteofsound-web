import { Link } from 'react-router-dom'
import type { FeedArtistTag } from '@/lib/community/feedTypes'
import { IOSImage } from '@/components/ui/IOSImage'

interface FeedPostArtistTagsProps {
  artists: FeedArtistTag[]
  className?: string
}

export function FeedPostArtistTags({ artists, className }: FeedPostArtistTagsProps) {
  if (artists.length === 0) return null

  return (
    <div className={className ?? 'community-feed-artist-tags'}>
      <span className="community-feed-artist-tags-label">Supporting</span>
      <ul className="community-feed-artist-tags-list">
        {artists.map((artist) => (
          <li key={artist.id}>
            <Link
              to={`/artists/${artist.slug}`}
              className="community-feed-artist-tag"
              title={`${artist.displayName} on IOS`}
            >
              {artist.avatarUrl ? (
                <IOSImage
                  src={artist.avatarUrl}
                  alt=""
                  width={20}
                  height={20}
                  className="community-feed-artist-tag-avatar"
                />
              ) : (
                <span className="community-feed-artist-tag-fallback" aria-hidden>
                  {artist.displayName.charAt(0).toUpperCase()}
                </span>
              )}
              <span className="community-feed-artist-tag-name">{artist.displayName}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
