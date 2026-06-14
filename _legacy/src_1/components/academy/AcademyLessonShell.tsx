import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import type { AcademyLesson } from '@/lib/academy/types'
import { getTrackBySlug } from '@/lib/academy/registry'

interface AcademyLessonShellProps {
  lesson: AcademyLesson
  /** Wider layout for lesson pages with a media sidebar */
  wide?: boolean
  children: ReactNode
}

export function AcademyLessonShell({ lesson, wide = false, children }: AcademyLessonShellProps) {
  const track = getTrackBySlug(lesson.trackSlug)

  return (
    <div className="academy-page">
      <div className={`academy-page-inner${wide ? ' academy-page-inner-wide' : ''}`}>
        <nav className="academy-breadcrumb" aria-label="Breadcrumb">
          <Link to="/academy">Academy</Link>
          <span aria-hidden>/</span>
          <Link to={`/academy/${lesson.trackSlug}`}>{track?.title ?? lesson.trackSlug}</Link>
          <span aria-hidden>/</span>
          <span>{lesson.id}</span>
        </nav>

        <header className="academy-lesson-hero">
          <div className="academy-lesson-hero-top">
            <p className="academy-lesson-code">
              {lesson.id} · {lesson.level} · {lesson.duration}
            </p>
            <h1 className="academy-lesson-title font-display">{lesson.title}</h1>
            <p className="academy-lesson-summary">{lesson.summary}</p>
          </div>
          <div className="academy-lesson-outcome">
            <span className="academy-lesson-outcome-k">You will learn</span>
            <p>{lesson.outcome}</p>
          </div>
        </header>

        {children}
      </div>
    </div>
  )
}
