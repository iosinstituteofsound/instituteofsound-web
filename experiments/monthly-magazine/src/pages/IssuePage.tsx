import { Link, useParams } from 'react-router-dom'
import { getIssue } from '../data/issues'

export function IssuePage() {
  const { slug } = useParams()
  const issue = slug ? getIssue(slug) : undefined

  if (!issue) {
    return (
      <main className="mm-page">
        <p>Issue not found.</p>
        <Link to="/" className="mm-back">
          ← All issues
        </Link>
      </main>
    )
  }

  return (
    <main className="mm-page mm-page--issue">
      <Link to="/" className="mm-back">
        ← All issues
      </Link>

      <div className="mm-issue">
        <img src={issue.coverUrl} alt="" className="mm-issue__cover" />
        <div className="mm-issue__main">
          <span className="mm-card__label">{issue.label}</span>
          <h1 className="mm-title">{issue.title}</h1>
          <p className="mm-lead">{issue.blurb}</p>

          <div className="mm-downloads">
            <a
              href={issue.pdfUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="mm-btn mm-btn--primary"
            >
              Download PDF
            </a>
            <a
              href={issue.epubUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="mm-btn mm-btn--ghost"
            >
              Download EPUB
            </a>
          </div>

          <p className="mm-note">
            Demo uses sample files from the web. Production will use your uploads + subscriber
            check.
          </p>

          <button type="button" className="mm-btn mm-btn--ghost" disabled>
            Subscribe for full library
          </button>
        </div>
      </div>
    </main>
  )
}
