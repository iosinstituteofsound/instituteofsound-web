import { Link } from 'react-router-dom'
import { ArrowUpRight, Clock, Eye } from 'lucide-react'
import type { ArticleDto } from '@/modules/explore/types/explore.types'
import {
  articleCategory,
  articleDate,
  articleReadTime,
  articleViews,
} from '@/modules/explore/lib/editorial-meta'

interface LandingEditorialSpotlightProps {
  coverStory: ArticleDto | null
  sidebar: ArticleDto[]
}

export function LandingEditorialSpotlight({ coverStory, sidebar }: LandingEditorialSpotlightProps) {
  const sideItems = sidebar.slice(0, 2)
  if (!coverStory && sideItems.length === 0) return null

  return (
    <section className="landing-section" aria-labelledby="landing-editorial-title">
      <header className="landing-section-head">
        <div>
          <p className="landing-section-head__num">02</p>
          <p className="landing-section-head__kicker">Desk</p>
          <h2 id="landing-editorial-title" className="landing-section-head__title">
            Editorial spotlight
          </h2>
          <p className="landing-section-head__sub">
            Features, reviews, and scene intelligence from the IOS desk.
          </p>
        </div>
        <Link to="/explore" className="landing-section-head__link">
          Full editorial
          <ArrowUpRight size={16} aria-hidden />
        </Link>
      </header>

      <div className="landing-editorial__grid">
        {coverStory ? (
          <Link
            to={`/explore/articles/${coverStory.slug}`}
            className="explore-ed-lead explore-ed-glass"
          >
            {coverStory.coverUrl ? (
              <img src={coverStory.coverUrl} alt="" loading="lazy" className="explore-ed-lead__img" />
            ) : (
              <span className="explore-ed-lead__img explore-ed-lead__img--empty" aria-hidden />
            )}
            <div className="explore-ed-lead__scrim" aria-hidden />
            <div className="explore-ed-lead__body">
              <span className="explore-ed-lead__tag">{articleCategory(coverStory)}</span>
              <h3 className="explore-ed-lead__title">{coverStory.title}</h3>
              {coverStory.excerpt ? (
                <p className="explore-ed-lead__excerpt">{coverStory.excerpt}</p>
              ) : null}
            </div>
            <div className="explore-ed-lead__foot explore-ed-glass-panel">
              <div className="explore-ed-lead__brand">
                <span className="explore-ed-lead__mark">IOS</span>
                <span className="explore-ed-lead__desk">IOS Editorial</span>
                <span className="explore-ed-lead__date">{articleDate(coverStory)}</span>
              </div>
              <div className="explore-ed-lead__stats">
                <span>
                  <Clock size={13} strokeWidth={1.75} aria-hidden />
                  {articleReadTime(coverStory.slug)}
                </span>
                <span>
                  <Eye size={13} strokeWidth={1.75} aria-hidden />
                  {articleViews(coverStory.slug)} views
                </span>
              </div>
            </div>
          </Link>
        ) : null}

        {sideItems.length > 0 ? (
          <div className="explore-ed-stack explore-ed-glass">
            {sideItems.map((article, i) => (
              <article key={article.id} className="explore-ed-row">
                <Link
                  to={`/explore/articles/${article.slug}`}
                  className="explore-ed-row__link"
                  aria-label={article.title}
                >
                  <span className="explore-ed-row__idx">{String(i + 2).padStart(2, '0')}</span>
                  {article.coverUrl ? (
                    <img src={article.coverUrl} alt="" loading="lazy" className="explore-ed-row__thumb" />
                  ) : (
                    <span className="explore-ed-row__thumb explore-ed-row__thumb--empty" aria-hidden />
                  )}
                  <div className="explore-ed-row__body">
                    <p className="explore-ed-row__cat">{articleCategory(article)}</p>
                    <p className="explore-ed-row__title">{article.title}</p>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}
