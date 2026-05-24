import { Link, Navigate, useParams } from 'react-router-dom'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { getLessonsForTrack, getQuizForTrack, getTrackBySlug } from '@/lib/academy/registry'
import { getQuizBestScore } from '@/lib/academy/progress'
import { trackProgressPercent } from '@/lib/academy/progress'
import { useAcademyProgress } from '@/hooks/useAcademyProgress'
import clsx from 'clsx'

export default function AcademyTrackPage() {
  const { track: trackSlug } = useParams<{ track: string }>()
  const track = getTrackBySlug(trackSlug ?? '')
  const lessons = track ? getLessonsForTrack(track.slug) : []
  const { completedLessons } = useAcademyProgress()
  const lessonIds = lessons.map((l) => l.id)
  const completedSet = new Set(completedLessons)
  const trackCompleted = lessons.filter((l) => completedSet.has(l.id)).length
  const progress = trackProgressPercent(lessonIds)

  const quiz = track ? getQuizForTrack(track.slug) : undefined
  const quizBest = quiz ? getQuizBestScore(quiz.id) : null

  if (!track) return <Navigate to="/academy" replace />

  return (
    <div className="section-padding pt-32">
      <div className="max-w-5xl mx-auto">
        <Link to="/academy" className="academy-breadcrumb academy-breadcrumb-standalone">
          ← Academy home
        </Link>

        <SectionHeading
          label={`Academy · ${track.phase}`}
          title={track.title}
          subtitle={track.description}
        />

        <div className="academy-track-progress">
          <span className="academy-track-progress-pct">{progress}%</span>
          <div className="ios-tools-meter-track academy-track-progress-bar">
            <span className="ios-tools-meter-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="academy-track-progress-label">
            {trackCompleted} of {lessons.length} lessons complete in this track
          </span>
        </div>

        {track.slug === 'ear-training' && (
          <div className="academy-track-quiz-cta">
            <div>
              <p className="academy-track-quiz-k">Interactive Ear Lab</p>
              <p className="academy-track-quiz-t">Frequency drill · 10 rounds</p>
            </div>
            <Link to="/academy/ear-lab" className="ios-btn ios-btn-metal">
              Open Ear Lab
            </Link>
          </div>
        )}

        {quiz && (
          <div className="academy-track-quiz-cta">
            <div>
              <p className="academy-track-quiz-k">Track quiz</p>
              <p className="academy-track-quiz-t">{quiz.title} · {quiz.questions.length} questions</p>
              {quizBest !== null && (
                <p className="academy-track-quiz-score">Best score: {quizBest}%</p>
              )}
            </div>
            <Link to={`/academy/quiz/${quiz.slug}`} className="ios-btn ios-btn-metal">
              {quizBest !== null ? 'Retake quiz' : 'Take quiz'}
            </Link>
          </div>
        )}

        <div className="academy-module-stack">
          {lessons.map((module, index) => {
            const done = completedSet.has(module.id)
            return (
              <article key={module.id} className={clsx('academy-module-card', done && 'academy-module-done')}>
                <div className="academy-module-head">
                  <span className="academy-module-id">
                    Lesson {index + 1} · {module.id}
                  </span>
                  <span className="academy-module-level">{module.level}</span>
                  <span className="academy-module-time">{module.duration}</span>
                  {done && <span className="academy-module-done-badge">Complete</span>}
                </div>
                <h3>
                  <Link to={`/academy/${track.slug}/${module.slug}`}>{module.title}</Link>
                </h3>
                <p>{module.summary}</p>
                <p className="academy-module-outcome">
                  <strong>Outcome:</strong> {module.outcome}
                </p>
                <Link
                  to={`/academy/${track.slug}/${module.slug}`}
                  className="ios-btn ios-btn-metal academy-module-cta"
                >
                  Open full lesson →
                </Link>
              </article>
            )
          })}
        </div>
      </div>
    </div>
  )
}
