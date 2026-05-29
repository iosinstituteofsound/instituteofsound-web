import { Link } from 'react-router-dom'
import { SAMPLE_ISSUES } from '../data/issues'

export function CatalogPage() {
  return (
    <main className="mm-page">
      <div className="mm-page__head">
        <p className="mm-kicker">Institute of Sound</p>
        <h1 className="mm-title">Monthly Magazine</h1>
        <p className="mm-lead">
          Subscribe once, download every issue as PDF or EPUB. This lab is separate from web
          articles and reviews.
        </p>
        <button type="button" className="mm-btn mm-btn--primary" disabled title="Stripe later">
          Subscribe — coming soon
        </button>
      </div>

      <ul className="mm-grid">
        {SAMPLE_ISSUES.map((issue) => (
          <li key={issue.slug}>
            <Link to={`/issue/${issue.slug}`} className="mm-card">
              <img src={issue.coverUrl} alt="" className="mm-card__cover" />
              <div className="mm-card__body">
                <span className="mm-card__label">{issue.label}</span>
                <h2 className="mm-card__title">{issue.title}</h2>
                <p className="mm-card__blurb">{issue.blurb}</p>
                <span className="mm-card__cta">View issue →</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
