import { Link } from 'react-router-dom'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ACADEMY_QUIZZES, getTrackBySlug } from '@/lib/academy/registry'
import { getQuizBestScore } from '@/lib/academy/progress'
import clsx from 'clsx'

export default function AcademyQuizzesHubPage() {
  const scores = ACADEMY_QUIZZES.map((q) => ({
    quiz: q,
    best: getQuizBestScore(q.id),
  }))
  const passedCount = scores.filter(
    (s) => s.best !== null && s.best >= s.quiz.passPercent
  ).length

  return (
    <div className="section-padding pt-32">
      <div className="max-w-5xl mx-auto">
        <Link to="/academy" className="academy-breadcrumb academy-breadcrumb-standalone">
          ← Academy home
        </Link>

        <SectionHeading
          label="Academy · Phase 2"
          title="Track quizzes"
          subtitle="Five-question reviews with instant explanations. Pass at 70% — scores save in your browser."
          align="center"
          titleAs="h1"
        />

        {passedCount > 0 && (
          <p className="academy-quiz-hub-summary text-center text-sm text-muted mb-8">
            {passedCount} of {ACADEMY_QUIZZES.length} quizzes passed on this device
          </p>
        )}

        <div className="academy-quiz-hub-grid">
          {scores.map(({ quiz, best }) => {
            const track = getTrackBySlug(quiz.trackSlug)
            const passed = best !== null && best >= quiz.passPercent
            return (
              <article key={quiz.id} className="academy-quiz-hub-card">
                <p className="academy-quiz-hub-id">{quiz.id}</p>
                <h3>{quiz.title}</h3>
                <p className="academy-quiz-hub-track">{track?.title ?? quiz.trackSlug}</p>
                <p>{quiz.description}</p>
                <p className="academy-quiz-hub-meta">
                  {quiz.questions.length} questions · Pass {quiz.passPercent}%
                </p>
                {best !== null && (
                  <p className={clsx('academy-quiz-hub-score', passed && 'academy-quiz-pass')}>
                    Best score: {best}%
                  </p>
                )}
                <div className="academy-quiz-hub-actions">
                  <Link to={`/academy/quiz/${quiz.slug}`} className="ios-btn ios-btn-metal">
                    {best !== null ? 'Retake quiz' : 'Start quiz'}
                  </Link>
                  <Link to={`/academy/${quiz.trackSlug}`} className="ios-btn ios-btn-ghost">
                    Study track
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </div>
  )
}
