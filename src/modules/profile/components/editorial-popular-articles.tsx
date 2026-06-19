import { Link } from 'react-router-dom'
import type { ArticleDto } from '@/modules/explore/types/explore.types'
import {
  articleDate,
  articleReadTime,
  articleViews,
} from '@/modules/explore/lib/editorial-meta'

type EditorialPopularArticlesProps = {
  articles: ArticleDto[]
}

export function EditorialPopularArticles({ articles }: EditorialPopularArticlesProps) {
  if (articles.length === 0) return null

  return (
    <section
      className="profile-ed-panel profile-ed-glass profile-ed-popular-panel"
      aria-labelledby="profile-ed-popular-heading"
    >
      <header className="profile-ed-panel__head">
        <h2
          id="profile-ed-popular-heading"
          className="profile-ed-panel__title profile-ed-popular-panel__title"
        >
          Popular Articles
        </h2>
        <a href="#profile-ed-latest" className="profile-ed-panel__action">
          View all
        </a>
      </header>

      <ol className="profile-ed-popular">
        {articles.map((article, index) => (
          <li
            key={article.id}
            className="profile-ed-popular__row"
            style={{ '--profile-ed-popular-delay': `${70 + index * 45}ms` } as React.CSSProperties}
          >
            <Link to={`/explore/articles/${article.slug}`} className="profile-ed-popular__link">
              <span className="profile-ed-popular__idx">{String(index + 1).padStart(2, '0')}</span>
              <span className="profile-ed-popular__thumb-wrap">
                {article.coverUrl ? (
                  <img src={article.coverUrl} alt="" loading="lazy" className="profile-ed-popular__thumb" />
                ) : (
                  <span className="profile-ed-popular__thumb profile-ed-popular__thumb--empty" aria-hidden />
                )}
              </span>
              <div className="profile-ed-popular__body">
                <p className="profile-ed-popular__title">{article.title}</p>
                <p className="profile-ed-popular__meta">
                  {articleReadTime(article.slug)} • {articleDate(article)}
                </p>
              </div>
              <span className="profile-ed-popular__reads">{articleViews(article.slug)} reads</span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  )
}
