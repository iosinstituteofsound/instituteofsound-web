import { Link } from 'react-router-dom'
import { FileText } from 'lucide-react'
import type { CuratorEditorialArticleDto } from '@/modules/explore/types/explore.types'
import { curatorShortDate } from '@/modules/profile/lib/curator-format'
import { CuratorGlassSection } from '@/modules/profile/components/curator/curator-glass-section'

type CuratorEditorialContributionsProps = {
  articles: CuratorEditorialArticleDto[]
  viewAllHref?: string
}

export function CuratorEditorialContributions({
  articles,
  viewAllHref = '/explore#explore-editorial',
}: CuratorEditorialContributionsProps) {
  if (articles.length === 0) return null

  return (
    <CuratorGlassSection
      title="Editorial Contributions"
      id="curator-editorial-heading"
      viewAllHref={viewAllHref}
      viewAllLabel="View all"
      className="curator-editorial"
    >
      <ul className="curator-editorial__list">
        {articles.map((article) => (
          <li key={article.id}>
            <Link to={`/explore/articles/${article.slug}`} className="curator-editorial__item">
              <span className="curator-editorial__icon" aria-hidden>
                <FileText size={14} strokeWidth={1.65} />
              </span>
              <div className="curator-editorial__copy">
                <p className="curator-editorial__title">{article.title}</p>
                <p className="curator-editorial__meta">
                  {curatorShortDate(article.publishedAt)} · {article.readTimeMin} min read
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </CuratorGlassSection>
  )
}
