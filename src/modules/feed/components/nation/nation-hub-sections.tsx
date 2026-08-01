import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { useNationTopArtists } from '@/modules/feed/hooks/use-nation-top-artists'
import { useNationTrendingTracks } from '@/modules/feed/hooks/use-nation-trending-tracks'
import { useNationRecentActivity } from '@/modules/feed/hooks/use-nation-recent-activity'
import { useNationMagazineArticles } from '@/modules/feed/hooks/use-nation-magazine-articles'
import { formatMagazineArticleDate } from '@/modules/feed/lib/nation-magazine-format'
import { UserAvatar } from '@/shared/components/user'
import { VerifiedUserName } from '@/shared/components/icons/verified-user-name'

export function NationTopArtistsSection() {
  const { data, isLoading } = useNationTopArtists(10)
  const items = data?.items ?? []

  return (
    <section className="nation-section">
      <div className="nation-section__head">
        <h2 className="nation-section__title">Your Top Artists</h2>
        {items.length > 0 ? (
          <Link to="/explore" className="nation-section__link">
            Explore
            <ChevronRight className="h-3 w-3" />
          </Link>
        ) : null}
      </div>

      {isLoading ? (
        <div className="nation-card nation-card--center">Loading artists…</div>
      ) : items.length === 0 ? (
        <div className="nation-card">
          <p className="nation-card__label">No top artists yet</p>
          <p className="nation-card__body">Listen and support artists to build your Nation chart.</p>
          <div className="nation-actions">
            <Link to="/explore" className="nation-btn nation-btn--primary">
              Discover artists
            </Link>
          </div>
        </div>
      ) : (
        <div className="nation-artist-rail">
          {items.map((artist) => (
            <Link
              key={artist.artistProfileId}
              to={`/profile/${artist.userId}`}
              className="nation-artist-card"
            >
              <UserAvatar
                name={artist.displayName}
                avatarUrl={artist.avatarUrl}
                className="nation-artist-card__avatar"
              />
              <VerifiedUserName
                name={artist.displayName}
                isVerified={artist.isVerified}
                nameClassName="nation-artist-card__name"
              />
              <span className="nation-artist-card__meta">
                #{artist.rank} · {artist.plays.toLocaleString()} plays
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}

export function NationRecentActivitySection() {
  const { data, isLoading } = useNationRecentActivity()
  const items = (data?.items ?? []).slice(0, 4)

  if (!isLoading && items.length === 0) return null

  return (
    <section className="nation-section">
      <div className="nation-section__head">
        <h2 className="nation-section__title nation-section__title--accent">Recent Activity</h2>
      </div>
      <div className="nation-card">
        {isLoading ? (
          <div className="nation-card--center py-6">Loading activity…</div>
        ) : (
          <ul className="nation-activity-list">
            {items.map((item, index) => (
              <li
                key={item.id}
                className={index < items.length - 1 ? 'nation-activity-list__item--divider' : undefined}
              >
                <p className="nation-activity-list__text">
                  {item.segments.map((segment, segmentIndex) =>
                    segment.bold ? (
                      <strong key={`${item.id}-${segmentIndex}`}>{segment.text}</strong>
                    ) : (
                      <span key={`${item.id}-${segmentIndex}`}>{segment.text}</span>
                    ),
                  )}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

export function NationMagazineArticlesSection() {
  const { data, isLoading } = useNationMagazineArticles(8)
  const items = data?.items ?? []

  if (!isLoading && items.length === 0) return null

  return (
    <section className="nation-section">
      <div className="nation-section__head">
        <h2 className="nation-section__title nation-section__title--accent">Latest From Magazine</h2>
        <Link to="/explore" className="nation-section__link nation-section__link--muted">
          View All
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="nation-card">
        {isLoading ? (
          <div className="nation-card--center py-8">Loading magazine…</div>
        ) : (
          <div className="nation-magazine-rail">
            {items.map((article) => (
              <Link
                key={article.id}
                to={`/explore/articles/${article.slug}`}
                className="nation-magazine-card"
              >
                {article.coverUrl ? (
                  <img src={article.coverUrl} alt="" className="nation-magazine-card__cover" />
                ) : (
                  <div className="nation-magazine-card__cover nation-magazine-card__cover--empty" />
                )}
                <span className="nation-magazine-card__category">{article.categoryLabel}</span>
                <strong className="nation-magazine-card__title">{article.title}</strong>
                <em className="nation-magazine-card__date">
                  {formatMagazineArticleDate(article.publishedAt)}
                </em>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export function NationTrendingNowSection() {
  const { data, isLoading } = useNationTrendingTracks(5)
  const items = data?.items ?? []

  if (!isLoading && items.length === 0) return null

  return (
    <section className="nation-section">
      <div className="nation-section__head">
        <h2 className="nation-section__title nation-section__title--accent">Trending Now</h2>
        <Link to="/releases" className="nation-section__link nation-section__link--muted">
          View All
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="nation-card">
        {isLoading ? (
          <div className="nation-card--center py-8">Loading trending…</div>
        ) : (
          <ul className="nation-trending-list">
            {items.map((track, index) => (
              <li key={track.trackId}>
                <Link
                  to={`/releases/${track.releaseId}`}
                  className={
                    index < items.length - 1
                      ? 'nation-trending-row nation-trending-row--divider'
                      : 'nation-trending-row'
                  }
                >
                  <span className="nation-trending-row__rank">{track.rank}</span>
                  {track.coverUrl ? (
                    <img src={track.coverUrl} alt="" className="nation-trending-row__cover" />
                  ) : (
                    <span className="nation-trending-row__cover nation-trending-row__cover--empty" />
                  )}
                  <span className="nation-trending-row__copy">
                    <strong>{track.title}</strong>
                    <em>
                      {track.artistName ?? 'Unknown'} · {track.tagLabel}
                    </em>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
