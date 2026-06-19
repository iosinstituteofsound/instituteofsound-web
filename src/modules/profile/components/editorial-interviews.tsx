import { Link } from 'react-router-dom'
import type { ArticleDto } from '@/modules/explore/types/explore.types'
import { articleCategory, articleDate } from '@/modules/explore/lib/editorial-meta'
import '@/modules/profile/styles/editorial-interviews-device.css'

type EditorialInterviewsProps = {
  articles: ArticleDto[]
}

export function EditorialInterviews({ articles }: EditorialInterviewsProps) {
  if (articles.length === 0) return null

  return (
    <aside id="profile-ed-interviews" className="ed-int-dev" aria-labelledby="ed-int-dev-heading">
      <div className="ed-int-dev__chassis">
        <span className="ed-int-dev__bolt ed-int-dev__bolt--tl" aria-hidden />
        <span className="ed-int-dev__bolt ed-int-dev__bolt--tr" aria-hidden />
        <span className="ed-int-dev__bolt ed-int-dev__bolt--bl" aria-hidden />
        <span className="ed-int-dev__bolt ed-int-dev__bolt--br" aria-hidden />
        <span className="ed-int-dev__rail ed-int-dev__rail--left" aria-hidden />
        <span className="ed-int-dev__rail ed-int-dev__rail--right" aria-hidden />

        <header className="ed-int-dev__header">
          <span className="ed-int-dev__vents" aria-hidden />
          <div className="ed-int-dev__header-left">
            <span className="ed-int-dev__led-bank" aria-hidden>
              <span className="ed-int-dev__led" />
              <span className="ed-int-dev__led ed-int-dev__led--dim" />
              <span className="ed-int-dev__led ed-int-dev__led--dim" />
            </span>
            <span className="ed-int-dev__module-id">IV-03</span>
          </div>
          <div className="ed-int-dev__header-center">
            <p className="ed-int-dev__kicker">:: Signal desk</p>
            <h2 id="ed-int-dev-heading" className="ed-int-dev__title">
              Interviews
            </h2>
          </div>
          <a href="#profile-ed-latest" className="ed-int-dev__header-action">
            View all
          </a>
        </header>

        <div className="ed-int-dev__screen">
          <span className="ed-int-dev__screen-bezel" aria-hidden />
          <span className="ed-int-dev__screen-grid" aria-hidden />
          <span className="ed-int-dev__screen-scan" aria-hidden />
          <span className="ed-int-dev__screen-glow" aria-hidden />
          <span className="ed-int-dev__screen-noise" aria-hidden />

          <ul className="ed-int-dev__channels">
            {articles.map((article, index) => (
              <li
                key={article.id}
                className="ed-int-dev__channel"
                style={{ '--ed-int-channel-delay': `${50 + index * 38}ms` } as React.CSSProperties}
              >
                <div className="ed-int-dev__channel-link">
                  <Link to={`/explore/articles/${article.slug}`} className="ed-int-dev__thumb-wrap">
                    {article.coverUrl ? (
                      <img src={article.coverUrl} alt="" loading="lazy" className="ed-int-dev__thumb" />
                    ) : (
                      <span className="ed-int-dev__thumb ed-int-dev__thumb--empty" aria-hidden />
                    )}
                    <span className="ed-int-dev__thumb-scan" aria-hidden />
                  </Link>
                  <Link to={`/explore/articles/${article.slug}`} className="ed-int-dev__copy">
                    <p className="ed-int-dev__item-title">{article.title}</p>
                    <p className="ed-int-dev__item-meta">
                      {articleCategory(article)} • {articleDate(article)}
                    </p>
                  </Link>
                  <Link to={`/explore/articles/${article.slug}`} className="ed-int-dev__action">
                    View Conversation
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <footer className="ed-int-dev__footer">
          <span className="ed-int-dev__footer-tag">
            <span className="ed-int-dev__footer-dot" aria-hidden />
            Desk live
          </span>
          <span className="ed-int-dev__footer-line" aria-hidden />
          <span className="ed-int-dev__footer-tag">
            {String(articles.length).padStart(2, '0')} feeds
          </span>
          <span className="ed-int-dev__footer-line" aria-hidden />
          <span className="ed-int-dev__footer-tag">v1.2</span>
        </footer>
      </div>
    </aside>
  )
}
