import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Input } from '@/components/ui/Input'
import {
  getContinueLesson,
  getLessonProgressSummary,
  searchAcademyLessons,
  trackTitleForLesson,
} from '@/lib/academy/hub'
import { useAcademyProgress } from '@/hooks/useAcademyProgress'

export function AcademyHubContinue() {
  const { completedLessons } = useAcademyProgress()
  const summary = getLessonProgressSummary(completedLessons)
  const next = getContinueLesson(completedLessons)

  if (summary.done === 0) {
    return (
      <div className="academy-hub-continue academy-hub-continue-start">
        <div>
          <p className="academy-hub-continue-kicker">Start here</p>
          <h2 className="academy-hub-continue-title">Begin with Production Fundamentals</h2>
          <p className="academy-hub-continue-meta">Lesson P1-01 · Sound, dB, and digital audio</p>
        </div>
        <Link to="/academy/production/p1-01" className="ios-btn ios-btn-metal">
          Start lesson →
        </Link>
      </div>
    )
  }

  if (!next) {
    return (
      <div className="academy-hub-continue academy-hub-continue-done">
        <div>
          <p className="academy-hub-continue-kicker">Curriculum complete</p>
          <h2 className="academy-hub-continue-title">All {summary.total} lessons marked done</h2>
          <p className="academy-hub-continue-meta">
            Run Ear Lab drills, pass track quizzes, and print certificates.
          </p>
        </div>
        <div className="academy-hub-continue-actions">
          <Link to="/academy/ear-lab" className="ios-btn ios-btn-metal">
            Ear Lab →
          </Link>
          <Link to="/academy/certificates" className="ios-btn ios-btn-ghost">
            Certificates
          </Link>
        </div>
      </div>
    )
  }

  const trackName = trackTitleForLesson(next)

  return (
    <div className="academy-hub-continue">
      <div>
        <p className="academy-hub-continue-kicker">Continue where you left off</p>
        <h2 className="academy-hub-continue-title">{next.title}</h2>
        <p className="academy-hub-continue-meta">
          {next.id} · {trackName} · {summary.done}/{summary.total} lessons ({summary.pct}%)
        </p>
      </div>
      <Link
        to={`/academy/${next.trackSlug}/${next.slug}`}
        className="ios-btn ios-btn-metal"
      >
        Resume lesson →
      </Link>
    </div>
  )
}

export function AcademyHubSearch() {
  const [query, setQuery] = useState('')
  const results = useMemo(() => searchAcademyLessons(query), [query])

  return (
    <div className="academy-hub-search">
      <label htmlFor="academy-lesson-search" className="academy-hub-search-label">
        Search lessons
      </label>
      <Input
        id="academy-lesson-search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Title, ID (e.g. M1-02), track, or topic…"
        className="academy-hub-search-input"
        autoComplete="off"
      />
      {query.trim().length > 0 && (
        <ul className="academy-hub-search-results" role="listbox" aria-label="Lesson search results">
          {results.length === 0 ? (
            <li className="academy-hub-search-empty">No lessons match &ldquo;{query}&rdquo;</li>
          ) : (
            results.map(({ lesson, trackTitle, trackSlug }) => (
              <li key={lesson.id}>
                <Link
                  to={`/academy/${trackSlug}/${lesson.slug}`}
                  className="academy-hub-search-hit"
                  role="option"
                >
                  <span className="academy-hub-search-hit-id">{lesson.id}</span>
                  <span className="academy-hub-search-hit-copy">
                    <span className="academy-hub-search-hit-title">{lesson.title}</span>
                    <span className="academy-hub-search-hit-track">{trackTitle}</span>
                  </span>
                  <span className="academy-hub-search-hit-arrow" aria-hidden>
                    →
                  </span>
                </Link>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}
