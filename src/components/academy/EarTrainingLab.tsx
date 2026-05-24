import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  EAR_LAB_BANDS,
  EAR_LAB_MODES,
  EAR_LAB_PASS_SCORE,
  EAR_LAB_TOTAL_ROUNDS,
  getBandHz,
  pickCompressionRound,
  pickLevelRound,
  pickRandomBand,
  playCompressionPair,
  playLevelPair,
  playTone,
  type EarLabBand,
  type EarLabMode,
} from '@/lib/academy/earLab'
import { getEarLabScore, saveEarLabScore } from '@/lib/academy/progress'
import { useAcademyProgress } from '@/hooks/useAcademyProgress'
import clsx from 'clsx'

function DrillResult({
  mode,
  correct,
  onRetry,
}: {
  mode: EarLabMode
  correct: number
  onRetry: () => void
}) {
  const passed = correct >= EAR_LAB_PASS_SCORE
  const label = EAR_LAB_MODES.find((m) => m.id === mode)?.label ?? mode

  return (
    <div className="academy-ear-lab-result">
      <p className="academy-ear-lab-result-label">{label}</p>
      <p className="academy-ear-lab-result-score">
        {correct}/{EAR_LAB_TOTAL_ROUNDS}
      </p>
      <p className={clsx('academy-ear-lab-result-msg', passed && 'academy-quiz-pass')}>
        {passed ? 'Drill passed for this mode.' : `Need ${EAR_LAB_PASS_SCORE}/${EAR_LAB_TOTAL_ROUNDS} to count toward Ear Lab certificate.`}
      </p>
      <div className="academy-ear-lab-result-actions">
        <button type="button" className="ios-btn ios-btn-metal" onClick={onRetry}>
          Try again
        </button>
        <Link to="/academy/certificates" className="ios-btn ios-btn-ghost">
          Certificates
        </Link>
      </div>
    </div>
  )
}

function FrequencyDrill({ onBack }: { onBack: () => void }) {
  const [round, setRound] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [target, setTarget] = useState<EarLabBand | null>(null)
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle')
  const [picked, setPicked] = useState<EarLabBand | null>(null)
  const [finished, setFinished] = useState(false)

  const startRound = useCallback(() => {
    setTarget(pickRandomBand())
    setFeedback('idle')
    setPicked(null)
  }, [])

  const startSession = useCallback(() => {
    setRound(1)
    setCorrect(0)
    setFinished(false)
    startRound()
  }, [startRound])

  if (round === 0) {
    return (
      <div className="academy-ear-drill">
        <button type="button" className="academy-ear-back" onClick={onBack}>
          ← All drills
        </button>
        <p className="academy-ear-lab-intro">Guess Low / Mid / High after each tone.</p>
        <button type="button" className="ios-btn ios-btn-metal" onClick={startSession}>
          Start frequency drill
        </button>
      </div>
    )
  }

  if (finished) {
    return <DrillResult mode="frequency" correct={correct} onRetry={startSession} />
  }

  return (
    <div className="academy-ear-drill">
      <div className="academy-ear-lab-head">
        <span>
          Round {round}/{EAR_LAB_TOTAL_ROUNDS}
        </span>
        <span>Score {correct}</span>
      </div>
      <button type="button" className="ios-btn ios-btn-metal academy-ear-play" onClick={() => target && playTone(getBandHz(target))}>
        Play tone
      </button>
      <p className="academy-ear-prompt">Which band?</p>
      <div className="academy-ear-guess-grid">
        {EAR_LAB_BANDS.map((b) => (
          <button
            key={b.id}
            type="button"
            className={clsx(
              'academy-ear-guess',
              picked === b.id && feedback === 'correct' && 'academy-ear-guess-correct',
              picked === b.id && feedback === 'wrong' && 'academy-ear-guess-wrong'
            )}
            disabled={feedback !== 'idle'}
            onClick={() => {
              if (!target || feedback !== 'idle') return
              setPicked(b.id)
              const ok = b.id === target
              setFeedback(ok ? 'correct' : 'wrong')
              const next = ok ? correct + 1 : correct
              if (ok) setCorrect(next)
              window.setTimeout(() => {
                if (round >= EAR_LAB_TOTAL_ROUNDS) {
                  saveEarLabScore('frequency', next)
                  setFinished(true)
                  return
                }
                setRound((r) => r + 1)
                startRound()
              }, 1200)
            }}
          >
            {b.label}
            <span>{b.hz} Hz</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function LevelDrill({ onBack }: { onBack: () => void }) {
  const [round, setRound] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [roundData, setRoundData] = useState<{ louderFirst: boolean; hz: number } | null>(null)
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle')
  const [finished, setFinished] = useState(false)

  const startRound = useCallback(() => {
    setRoundData(pickLevelRound())
    setFeedback('idle')
  }, [])

  const startSession = useCallback(() => {
    setRound(1)
    setCorrect(0)
    setFinished(false)
    startRound()
  }, [startRound])

  if (round === 0) {
    return (
      <div className="academy-ear-drill">
        <button type="button" className="academy-ear-back" onClick={onBack}>
          ← All drills
        </button>
        <p className="academy-ear-lab-intro">Two tones back-to-back — which pass was louder?</p>
        <button type="button" className="ios-btn ios-btn-metal" onClick={startSession}>
          Start level drill
        </button>
      </div>
    )
  }

  if (finished) {
    return <DrillResult mode="level" correct={correct} onRetry={startSession} />
  }

  return (
    <div className="academy-ear-drill">
      <div className="academy-ear-lab-head">
        <span>
          Round {round}/{EAR_LAB_TOTAL_ROUNDS}
        </span>
        <span>Score {correct}</span>
      </div>
      <button
        type="button"
        className="ios-btn ios-btn-metal academy-ear-play"
        onClick={() => roundData && playLevelPair(roundData.hz, roundData.louderFirst)}
      >
        Play pair
      </button>
      <p className="academy-ear-prompt">Which was louder?</p>
      <div className="academy-ear-guess-grid academy-ear-guess-grid-2">
        {[
          { id: 'first', label: 'First tone' },
          { id: 'second', label: 'Second tone' },
        ].map((opt) => (
          <button
            key={opt.id}
            type="button"
            className={clsx('academy-ear-guess', feedback !== 'idle' && 'academy-ear-guess-locked')}
            disabled={feedback !== 'idle'}
            onClick={() => {
              if (!roundData || feedback !== 'idle') return
              const louderFirst = roundData.louderFirst
              const ok =
                (opt.id === 'first' && louderFirst) || (opt.id === 'second' && !louderFirst)
              setFeedback(ok ? 'correct' : 'wrong')
              const next = ok ? correct + 1 : correct
              if (ok) setCorrect(next)
              window.setTimeout(() => {
                if (round >= EAR_LAB_TOTAL_ROUNDS) {
                  saveEarLabScore('level', next)
                  setFinished(true)
                  return
                }
                setRound((r) => r + 1)
                startRound()
              }, 1400)
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {feedback !== 'idle' && (
        <p className="academy-ear-feedback">
          {feedback === 'correct' ? 'Correct.' : 'Listen again — level differences train gain staging judgment.'}
        </p>
      )}
    </div>
  )
}

function CompressionDrill({ onBack }: { onBack: () => void }) {
  const [round, setRound] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [roundData, setRoundData] = useState<{ punchIsFirst: boolean; hz: number } | null>(null)
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle')
  const [finished, setFinished] = useState(false)

  const startRound = useCallback(() => {
    setRoundData(pickCompressionRound())
    setFeedback('idle')
  }, [])

  const startSession = useCallback(() => {
    setRound(1)
    setCorrect(0)
    setFinished(false)
    startRound()
  }, [startRound])

  if (round === 0) {
    return (
      <div className="academy-ear-drill">
        <button type="button" className="academy-ear-back" onClick={onBack}>
          ← All drills
        </button>
        <p className="academy-ear-lab-intro">
          Hear A then B — one is more dynamic (punch), one is more compressed (squash).
        </p>
        <button type="button" className="ios-btn ios-btn-metal" onClick={startSession}>
          Start compression A/B
        </button>
      </div>
    )
  }

  if (finished) {
    return <DrillResult mode="compression" correct={correct} onRetry={startSession} />
  }

  return (
    <div className="academy-ear-drill">
      <div className="academy-ear-lab-head">
        <span>
          Round {round}/{EAR_LAB_TOTAL_ROUNDS}
        </span>
        <span>Score {correct}</span>
      </div>
      <button
        type="button"
        className="ios-btn ios-btn-metal academy-ear-play"
        onClick={() => roundData && playCompressionPair(roundData.hz, roundData.punchIsFirst)}
      >
        Play A → B
      </button>
      <p className="academy-ear-prompt">Which had more punch (less squash)?</p>
      <div className="academy-ear-guess-grid academy-ear-guess-grid-2">
        {[
          { id: 'first', label: 'Tone A' },
          { id: 'second', label: 'Tone B' },
        ].map((opt) => (
          <button
            key={opt.id}
            type="button"
            className="academy-ear-guess"
            disabled={feedback !== 'idle'}
            onClick={() => {
              if (!roundData || feedback !== 'idle') return
              const punchFirst = roundData.punchIsFirst
              const ok =
                (opt.id === 'first' && punchFirst) || (opt.id === 'second' && !punchFirst)
              setFeedback(ok ? 'correct' : 'wrong')
              const next = ok ? correct + 1 : correct
              if (ok) setCorrect(next)
              window.setTimeout(() => {
                if (round >= EAR_LAB_TOTAL_ROUNDS) {
                  saveEarLabScore('compression', next)
                  setFinished(true)
                  return
                }
                setRound((r) => r + 1)
                startRound()
              }, 1600)
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {feedback !== 'idle' && (
        <p className="academy-ear-feedback">
          {feedback === 'correct'
            ? 'Correct — dynamic tone keeps more transient punch.'
            : 'The squashed tone has heavier gain reduction — less crest factor.'}
        </p>
      )}
    </div>
  )
}

export function EarTrainingLab() {
  const { earLab } = useAcademyProgress()
  const [activeMode, setActiveMode] = useState<EarLabMode | null>(null)

  if (activeMode === 'frequency') {
    return <FrequencyDrill onBack={() => setActiveMode(null)} />
  }
  if (activeMode === 'level') {
    return <LevelDrill onBack={() => setActiveMode(null)} />
  }
  if (activeMode === 'compression') {
    return <CompressionDrill onBack={() => setActiveMode(null)} />
  }

  return (
    <div className="academy-ear-lab">
      <p className="academy-ear-lab-intro">
        Three drills · {EAR_LAB_TOTAL_ROUNDS} rounds each · Pass {EAR_LAB_PASS_SCORE}/{EAR_LAB_TOTAL_ROUNDS}{' '}
        per drill for the Ear Lab Specialist certificate. Use headphones at moderate volume.
      </p>
      <div className="academy-ear-mode-grid">
        {EAR_LAB_MODES.map((m) => {
          const best = earLab[m.id] ?? getEarLabScore(m.id)
          const passed = best >= EAR_LAB_PASS_SCORE
          return (
            <article key={m.id} className={clsx('academy-ear-mode-card', passed && 'academy-ear-mode-pass')}>
              <h3>{m.label}</h3>
              <p>{m.description}</p>
              <p className="academy-ear-mode-score">
                Best: {best}/{EAR_LAB_TOTAL_ROUNDS}
                {passed && ' · Passed'}
              </p>
              <button type="button" className="ios-btn ios-btn-metal" onClick={() => setActiveMode(m.id)}>
                {best > 0 ? 'Practice again' : 'Start drill'}
              </button>
            </article>
          )
        })}
      </div>
      <Link to="/academy/ear-training/e3-01" className="academy-ear-lab-lesson">
        Read ear training lessons →
      </Link>
    </div>
  )
}
