import { Link } from 'react-router-dom'
import type { EditorialReadingListDto } from '@/modules/explore/types/explore.types'

type EditorialArticleCatalogProps = {
  groups: EditorialReadingListDto[]
}

export function EditorialArticleCatalog({ groups }: EditorialArticleCatalogProps) {
  if (groups.length === 0) return null

  return (
    <section className="profile-ed-series" aria-labelledby="profile-ed-articles-heading">
      <header className="profile-ed-panel__head profile-ed-series__head">
        <h2 id="profile-ed-articles-heading" className="profile-ed-panel__title">
          All Articles
        </h2>
        <a href="#profile-ed-latest" className="profile-ed-panel__action">
          View all articles
        </a>
      </header>

      <div className="profile-ed-series__grid">
        {groups.map((group) => {
          const href = group.leadArticleSlug
            ? `/explore/articles/${group.leadArticleSlug}`
            : '#profile-ed-latest'

          return (
            <Link
              key={group.id}
              to={href}
              className="profile-ed-series__card profile-ed-glass"
            >
              {group.coverUrl ? (
                <img src={group.coverUrl} alt="" loading="lazy" className="profile-ed-series__img" />
              ) : (
                <span className="profile-ed-series__img profile-ed-series__img--empty" aria-hidden />
              )}
              <div className="profile-ed-series__copy">
                <h3 className="profile-ed-series__title">{group.title}</h3>
                <p className="profile-ed-series__count">
                  {group.articleCount} {group.articleCount === 1 ? 'article' : 'articles'}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
