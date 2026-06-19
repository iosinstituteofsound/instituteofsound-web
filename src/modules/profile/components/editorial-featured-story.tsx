import { Link } from 'react-router-dom'
import { ArrowRight, Headphones, Play } from 'lucide-react'
import type { ArticleDto } from '@/modules/explore/types/explore.types'
import {
  articleDate,
  articleReadTime,
} from '@/modules/explore/lib/editorial-meta'
import { featuredArtistCount } from '@/modules/profile/lib/editorial-desk-format'
import { usePlayerStore } from '@/modules/player/stores/player-store'

type EditorialFeaturedStoryProps = {
  article: ArticleDto
}

function FeaturedAvatars({ article }: { article: ArticleDto }) {
  const sources =
    article.galleryUrls?.slice(0, 5) ??
    Array.from({ length: 5 }, (_, i) => `https://picsum.photos/seed/${article.slug}-av-${i}/80/80`)

  return (
    <div className="profile-ed-featured__artists">
      <div className="profile-ed-featured__avatars" aria-hidden>
        {sources.map((src, i) => (
          <img key={i} src={src} alt="" loading="lazy" className="profile-ed-featured__avatar" />
        ))}
      </div>
      <span className="profile-ed-featured__artist-count">
        {featuredArtistCount(article)} artists featured
      </span>
    </div>
  )
}

export function EditorialFeaturedStory({ article }: EditorialFeaturedStoryProps) {
  const playTrack = usePlayerStore((s) => s.playTrack)
  const puck = article.puckData as { sessionAudioUrl?: string } | undefined
  const hasAudio = Boolean(puck?.sessionAudioUrl)

  return (
    <article className="profile-ed-featured profile-ed-glass">
      {article.coverUrl ? (
        <img src={article.coverUrl} alt="" loading="lazy" className="profile-ed-featured__img" />
      ) : (
        <span className="profile-ed-featured__img profile-ed-featured__img--empty" aria-hidden />
      )}
      <div className="profile-ed-featured__scrim" aria-hidden />

      <div className="profile-ed-featured__content">
        <div className="profile-ed-featured__body">
          <span className="profile-ed-featured__label">
            <span className="profile-ed-featured__label-dot" aria-hidden />
            Featured Story
          </span>
          <h2 className="profile-ed-featured__title">{article.title}</h2>
          <p className="profile-ed-featured__meta">
            {articleReadTime(article.slug)}
            <span className="profile-ed-featured__meta-dot" aria-hidden>
              •
            </span>
            {articleDate(article)}
          </p>
          {article.excerpt ? <p className="profile-ed-featured__excerpt">{article.excerpt}</p> : null}
          <FeaturedAvatars article={article} />
        </div>

        <div className="profile-ed-featured__foot">
          <Link to={`/explore/articles/${article.slug}`} className="profile-ed-featured__cta">
            Read Story
            <ArrowRight size={15} strokeWidth={2} aria-hidden />
          </Link>

          {hasAudio ? (
            <div className="profile-ed-featured__listen">
              <span className="profile-ed-featured__listen-label">
                <Headphones size={14} strokeWidth={1.75} aria-hidden />
                Listen while reading
              </span>
              <button
                type="button"
                className="profile-ed-featured__listen-play"
                aria-label="Play session audio"
                onClick={() =>
                  playTrack({
                    id: `${article.id}-session`,
                    title: article.title,
                    artist: 'IOS Editorial',
                    audioUrl: puck!.sessionAudioUrl!,
                    artworkUrl: article.coverUrl,
                  })
                }
              >
                <Play size={14} strokeWidth={2} fill="currentColor" aria-hidden />
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  )
}
