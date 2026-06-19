import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import type { ArticleDto } from '@/modules/explore/types/explore.types'
import { labelOverviewNewsDate } from '@/modules/profile/lib/label-overview-format'
import '@/modules/profile/styles/label-overview-latest-news.css'

type LabelOverviewLatestNewsProps = {
  articles: ArticleDto[]
  viewAllHref?: string
}

export function LabelOverviewLatestNews({
  articles,
  viewAllHref = '/explore#explore-editorial',
}: LabelOverviewLatestNewsProps) {
  if (articles.length === 0) return null

  return (
    <section className="lbl-ov-latest-news" aria-labelledby="lbl-ov-latest-news-heading">
      <header className="lbl-ov-latest-news__head">
        <h2 id="lbl-ov-latest-news-heading" className="lbl-ov-latest-news__title">
          Latest News
        </h2>
        <Link to={viewAllHref} className="lbl-ov-latest-news__view-all">
          View All News
          <ArrowRight size={14} strokeWidth={2.25} aria-hidden />
        </Link>
      </header>

      <ul className="lbl-ov-latest-news__list">
        {articles.map((article) => {
          const isDemo = article.id.startsWith('demo-')
          const href = isDemo ? '/explore#explore-editorial' : `/explore/articles/${article.slug}`

          return (
            <li key={article.id}>
              <Link to={href} className="lbl-ov-latest-news__item">
                {article.coverUrl ? (
                  <img src={article.coverUrl} alt="" loading="lazy" className="lbl-ov-latest-news__thumb" />
                ) : (
                  <span className="lbl-ov-latest-news__thumb lbl-ov-latest-news__thumb--empty" aria-hidden />
                )}

                <div className="lbl-ov-latest-news__copy">
                  <h3 className="lbl-ov-latest-news__headline">{article.title}</h3>
                  {article.excerpt ? (
                    <p className="lbl-ov-latest-news__excerpt">{article.excerpt}</p>
                  ) : null}
                  <time className="lbl-ov-latest-news__date" dateTime={article.publishedAt}>
                    {labelOverviewNewsDate(article)}
                  </time>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
