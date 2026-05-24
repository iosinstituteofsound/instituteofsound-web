import { Link } from 'react-router-dom'

interface RelatedItem {
  slug: string
  title: string
}

interface EditorialRelatedLinksProps {
  currentSlug: string
  items: RelatedItem[]
}

/** Internal links between editorial features for crawl paths. */
export function EditorialRelatedLinks({ currentSlug, items }: EditorialRelatedLinksProps) {
  const related = items.filter((f) => f.slug !== currentSlug).slice(0, 3)
  if (related.length === 0) return null

  return (
    <aside className="mt-16 pt-10 border-t border-border" aria-label="Related editorial">
      <h2 className="text-[10px] tracking-[0.3em] text-neon uppercase mb-4">More from the desk</h2>
      <ul className="space-y-3">
        {related.map((f) => (
          <li key={f.slug}>
            <Link to={`/feature/${f.slug}`} className="text-sm text-muted hover:text-neon transition-colors">
              {f.title}
            </Link>
          </li>
        ))}
      </ul>
      <Link to="/features" className="inline-block mt-6 text-xs tracking-widest text-muted hover:text-neon">
        All features →
      </Link>
      <span className="mx-3 text-border" aria-hidden>
        ·
      </span>
      <Link to="/discover" className="text-xs tracking-widest text-muted hover:text-neon">
        Discover artists →
      </Link>
      <span className="mx-3 text-border" aria-hidden>
        ·
      </span>
      <Link to="/academy" className="text-xs tracking-widest text-muted hover:text-neon">
        Production Academy →
      </Link>
    </aside>
  )
}
