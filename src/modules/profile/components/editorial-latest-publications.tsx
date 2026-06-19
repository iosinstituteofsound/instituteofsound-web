import { Link } from 'react-router-dom'
import { Bookmark } from 'lucide-react'
import type { EditorialPublicationDto } from '@/modules/explore/types/explore.types'
import { articleCategory, articleDate, articleReadTime } from '@/modules/explore/lib/editorial-meta'
import { articleTrackCount } from '@/modules/profile/lib/editorial-desk-format'

type EditorialLatestPublicationsProps = {
  articles: EditorialPublicationDto[]
}

export function EditorialLatestPublications({ articles }: EditorialLatestPublicationsProps) {
  if (articles.length === 0) return null

  return (
    <section
      id="profile-ed-latest"
      className="profile-ed-latest"
      aria-labelledby="profile-ed-latest-heading"
    >
      <header className="profile-ed-panel__head profile-ed-latest__head">
        <div className="profile-ed-latest__head-copy">
          <h2 id="profile-ed-latest-heading" className="profile-ed-panel__title">
            Latest Publications
          </h2>
          <p className="profile-ed-latest__kicker">Fresh writing from editors across the desk</p>
        </div>
        <Link to="/explore#explore-editorial" className="profile-ed-panel__action">
          View all articles
        </Link>
      </header>

      <div className="profile-ed-latest__grid">
        {articles.map((article) => {
          const tracks = articleTrackCount(article)

          return (
            <article key={article.id} className="profile-ed-latest__card profile-ed-glass">
              <Link to={`/explore/articles/${article.slug}`} className="profile-ed-latest__link">
                <div className="profile-ed-latest__media">
                  {article.coverUrl ? (
                    <img src={article.coverUrl} alt="" loading="lazy" className="profile-ed-latest__img" />
                  ) : (
                    <span className="profile-ed-latest__img profile-ed-latest__img--empty" aria-hidden />
                  )}
                  <span className="profile-ed-latest__media-scrim" aria-hidden />
                  {article.isCoverStory ? (
                    <span className="profile-ed-latest__badge">Featured</span>
                  ) : null}
                </div>
                <div className="profile-ed-latest__body">
                  <div className="profile-ed-latest__topline">
                    <p className="profile-ed-latest__date">{articleDate(article)}</p>
                    <p className="profile-ed-latest__byline">By {article.editorName}</p>
                  </div>
                  <h3 className="profile-ed-latest__title">{article.title}</h3>
                  <p className="profile-ed-latest__meta">
                    <span>{articleCategory(article)}</span>
                    <span className="profile-ed-latest__meta-dot" aria-hidden>
                      •
                    </span>
                    <span>{articleReadTime(article.slug)}</span>
                    {tracks > 0 ? (
                      <>
                        <span className="profile-ed-latest__meta-dot" aria-hidden>
                          •
                        </span>
                        <span>
                          {tracks} {tracks === 1 ? 'track' : 'tracks'}
                        </span>
                      </>
                    ) : null}
                  </p>
                  {article.excerpt ? (
                    <p className="profile-ed-latest__excerpt">{article.excerpt}</p>
                  ) : null}
                </div>
              </Link>
              <button
                type="button"
                className="profile-ed-latest__bookmark"
                aria-label={`Save ${article.title}`}
              >
                <Bookmark size={16} strokeWidth={1.5} aria-hidden />
              </button>
            </article>
          )
        })}
      </div>
    </section>
  )
}
