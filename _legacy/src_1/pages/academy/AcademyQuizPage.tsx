import { Link, Navigate, useParams } from 'react-router-dom'
import { AcademyQuizPanel } from '@/components/academy/AcademyQuizPanel'
import { getQuizBySlug, getTrackBySlug } from '@/lib/academy/registry'

export default function AcademyQuizPage() {
  const { quiz: quizSlug } = useParams<{ quiz: string }>()
  const quiz = getQuizBySlug(quizSlug ?? '')
  const track = quiz ? getTrackBySlug(quiz.trackSlug) : undefined

  if (!quiz) return <Navigate to="/academy/quizzes" replace />

  return (
    <div className="academy-page">
      <div className="academy-page-inner academy-page-inner-narrow">
        <nav className="academy-breadcrumb" aria-label="Breadcrumb">
          <Link to="/academy">Academy</Link>
          <span aria-hidden>/</span>
          <Link to="/academy/quizzes">Quizzes</Link>
          <span aria-hidden>/</span>
          <span>{quiz.id}</span>
        </nav>

        <header className="academy-lesson-hero">
          <p className="academy-lesson-code">{quiz.id} · Interactive · Pass {quiz.passPercent}%</p>
          <h1 className="academy-lesson-title font-display">{quiz.title}</h1>
          <p className="academy-lesson-summary">{quiz.description}</p>
          {track && (
            <p className="academy-quiz-track-link">
              Based on{' '}
              <Link to={`/academy/${track.slug}`}>{track.title}</Link>
            </p>
          )}
        </header>

        <AcademyQuizPanel quiz={quiz} />
      </div>
    </div>
  )
}
