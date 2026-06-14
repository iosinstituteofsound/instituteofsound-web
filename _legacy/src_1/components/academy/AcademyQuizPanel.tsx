import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { AcademyQuiz } from '@/lib/academy/types'
import { getQuizBestScore, saveQuizScore } from '@/lib/academy/progress'
import clsx from 'clsx'
import { AcademyTribeHint } from '@/components/academy/AcademyTribeHint'

interface AcademyQuizPanelProps {
  quiz: AcademyQuiz
}

export function AcademyQuizPanel({ quiz }: AcademyQuizPanelProps) {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [finished, setFinished] = useState(false)
  const previousBest = getQuizBestScore(quiz.id)

  const question = quiz.questions[index]
  const isLast = index === quiz.questions.length - 1
  const answered = selected !== null

  function handleSelect(optionId: string) {
    if (answered) return
    setSelected(optionId)
    if (optionId === question.correctId) {
      setCorrectCount((c) => c + 1)
    }
  }

  function handleNext() {
    if (!isLast) {
      setIndex((i) => i + 1)
      setSelected(null)
      return
    }
    const score = Math.round((correctCount / quiz.questions.length) * 100)
    saveQuizScore(quiz.id, score)
    setFinished(true)
  }

  const finalPercent = finished
    ? Math.round((correctCount / quiz.questions.length) * 100)
    : 0
  const passed = finalPercent >= quiz.passPercent

  if (finished) {
    return (
      <div className="academy-quiz-result">
        <p className="academy-quiz-result-label">Your score</p>
        <p className="academy-quiz-result-score">{finalPercent}%</p>
        <p className={clsx('academy-quiz-result-msg', passed ? 'academy-quiz-pass' : 'academy-quiz-fail')}>
          {passed
            ? `Passed — ${quiz.passPercent}% required. Great work.`
            : `Keep studying — ${quiz.passPercent}% to pass. Review the track lessons and try again.`}
        </p>
        {previousBest !== null && previousBest !== finalPercent && (
          <p className="academy-quiz-best">
            Previous best: {previousBest}% · New best saved: {Math.max(previousBest, finalPercent)}%
          </p>
        )}
        <AcademyTribeHint trackSlug={quiz.trackSlug} passed={passed} />
        <div className="academy-quiz-result-actions">
          <button
            type="button"
            className="ios-btn ios-btn-metal"
            onClick={() => {
              setIndex(0)
              setSelected(null)
              setCorrectCount(0)
              setFinished(false)
            }}
          >
            Retake quiz
          </button>
          <Link to={`/academy/${quiz.trackSlug}`} className="ios-btn ios-btn-ghost">
            Back to track
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="academy-quiz-panel">
      <div className="academy-quiz-progress-head">
        <span>
          Question {index + 1} of {quiz.questions.length}
        </span>
        {previousBest !== null && (
          <span className="academy-quiz-best-inline">Best: {previousBest}%</span>
        )}
      </div>
      <div className="ios-tools-meter-track academy-quiz-meter">
        <span
          className="ios-tools-meter-fill"
          style={{ width: `${((index + (answered ? 1 : 0)) / quiz.questions.length) * 100}%` }}
        />
      </div>

      <h2 className="academy-quiz-prompt">{question.prompt}</h2>

      <ul className="academy-quiz-options">
        {question.options.map((opt) => {
          let state: 'idle' | 'correct' | 'wrong' = 'idle'
          if (answered) {
            if (opt.id === question.correctId) state = 'correct'
            else if (opt.id === selected) state = 'wrong'
          }
          return (
            <li key={opt.id}>
              <button
                type="button"
                className={clsx('academy-quiz-option', state !== 'idle' && `academy-quiz-option-${state}`)}
                onClick={() => handleSelect(opt.id)}
                disabled={answered}
              >
                {opt.text}
              </button>
            </li>
          )
        })}
      </ul>

      {answered && (
        <div className="academy-quiz-explain">
          <p>{question.explanation}</p>
        </div>
      )}

      {answered && (
        <button type="button" className="ios-btn ios-btn-metal academy-quiz-next" onClick={handleNext}>
          {isLast ? 'See results' : 'Next question →'}
        </button>
      )}
    </div>
  )
}
