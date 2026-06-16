import { Link } from 'react-router-dom'
import { ArrowUpRight, Bookmark, Clock, Eye, Flame } from 'lucide-react'
import type { ArticleDto } from '@/modules/explore/types/explore.types'
import {
  articleCategory,
  articleDate,
  articleReadTime,
  articleViews,
} from '@/modules/explore/lib/editorial-meta'

function EditorialSidebarRow({
  article,
  index,
}: {
  article: ArticleDto
  index: number
}) {
  return (
    <article
      className="explore-ed-row"
      style={{ '--explore-ed-row-delay': `${120 + (index - 2) * 70}ms` } as React.CSSProperties}
    >
      <Link
        to={`/explore/articles/${article.slug}`}
        className="explore-ed-row__link"
        aria-label={article.title}
      >
        <span className="explore-ed-row__idx">{String(index).padStart(2, '0')}</span>
        {article.coverUrl ? (
          <img src={article.coverUrl} alt="" loading="lazy" className="explore-ed-row__thumb" />
        ) : (
          <span className="explore-ed-row__thumb explore-ed-row__thumb--empty" aria-hidden />
        )}
        <div className="explore-ed-row__body">
          <p className="explore-ed-row__cat">{articleCategory(article)}</p>
          <p className="explore-ed-row__title">{article.title}</p>
          <p className="explore-ed-row__meta">
            <span>
              <Clock size={13} strokeWidth={1.75} aria-hidden />
              {articleReadTime(article.slug)}
            </span>
            <span>
              <Eye size={13} strokeWidth={1.75} aria-hidden />
              {articleViews(article.slug)} views
            </span>
          </p>
        </div>
      </Link>
      <button
        type="button"
        className="explore-ed-row__bookmark"
        aria-label={`Save ${article.title}`}
        onClick={(e) => e.preventDefault()}
      >
        <Bookmark size={17} strokeWidth={1.5} aria-hidden />
      </button>
    </article>
  )
}

function EditorialLeadCard({ article }: { article: ArticleDto }) {
  return (
    <Link
      to={`/explore/articles/${article.slug}`}
      className="explore-ed-lead explore-ed-glass"
    >
      {article.coverUrl ? (
        <img src={article.coverUrl} alt="" loading="lazy" className="explore-ed-lead__img" />
      ) : (
        <span className="explore-ed-lead__img explore-ed-lead__img--empty" aria-hidden />
      )}
      <div className="explore-ed-lead__scrim" aria-hidden />
      <div className="explore-ed-lead__body">
        <span className="explore-ed-lead__tag">{articleCategory(article)}</span>
        <h3 className="explore-ed-lead__title">{article.title}</h3>
        {article.excerpt ? <p className="explore-ed-lead__excerpt">{article.excerpt}</p> : null}
      </div>
      <div className="explore-ed-lead__foot explore-ed-glass-panel">
        <div className="explore-ed-lead__brand">
          <span className="explore-ed-lead__mark">IOS</span>
          <span className="explore-ed-lead__desk">IOS Editorial</span>
          <span className="explore-ed-lead__date">{articleDate(article)}</span>
        </div>
        <div className="explore-ed-lead__stats">
          <span>
            <Clock size={13} strokeWidth={1.75} aria-hidden />
            {articleReadTime(article.slug)}
          </span>
          <span>
            <Eye size={13} strokeWidth={1.75} aria-hidden />
            {articleViews(article.slug)} views
          </span>
          <span className="explore-ed-lead__trending">
            <Flame size={13} strokeWidth={1.75} aria-hidden />
            Trending
          </span>
        </div>
        <span className="explore-ed-lead__arrow" aria-hidden>
          <ArrowUpRight size={18} strokeWidth={1.75} />
        </span>
      </div>
    </Link>
  )
}

export function ExploreEditorialSection({
  coverStory,
  sidebar,
}: {
  coverStory: ArticleDto | null
  sidebar: ArticleDto[]
}) {
  if (!coverStory && sidebar.length === 0) return null

  return (
    <section className="explore-section explore-ed-section">
      <header className="explore-ed-head">
        <div className="explore-ed-head__brand">
          <span className="explore-ed-head__num" aria-hidden>
            01
          </span>
          <div>
            <p className="explore-ed-head__kicker">Desk</p>
            <h2 className="explore-ed-head__title">Editorial</h2>
            <p className="explore-ed-head__sub">
              Features, reviews, and scene intelligence.
            </p>
          </div>
        </div>
      </header>

      <div className="explore-ed-grid">
        {coverStory ? <EditorialLeadCard article={coverStory} /> : null}
        {sidebar.length > 0 ? (
          <div className="explore-ed-stack explore-ed-glass">
            {sidebar.map((article, i) => (
              <EditorialSidebarRow
                key={article.id}
                article={article}
                index={i + 2}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}
