import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  EAR_FREQ_GAME_LIVES,
  EAR_FREQ_GAME_STAGES,
  EAR_SPECTRUM_HZ,
  frequencyGameScoreToProgress,
  nearestSpectrumHz,
  pickRandomSpectrumHz,
} from '@/lib/academy/earLabSpectrum'
import { playEqTrainingSound, stopEarLabAudio } from '@/lib/academy/earLabAudio'
import { EAR_LAB_PASS_SCORE } from '@/lib/academy/earLab'
import { saveEarLabScore } from '@/lib/academy/progress'
import clsx from 'clsx'

function formatHzLabel(hz: number): string {
  if (hz >= 1000) return `${Math.round(hz)}Hz`
  return `${hz}Hz`
}

interface EarFrequencyGameProps {
  onBack: () => void
}

export function EarFrequencyGame({ onBack }: EarFrequencyGameProps) {
  const [phase, setPhase] = useState<'idle' | 'playing' | 'over' | 'won'>('idle')
  const [stage, setStage] = useState(0)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(EAR_FREQ_GAME_LIVES)
  const [targetHz, setTargetHz] = useState(0)
  const [eqOn, setEqOn] = useState(true)
  const [muted, setMuted] = useState(false)
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong' | null>(null)
  const [highlightHz, setHighlightHz] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)

  const playCurrent = useCallback(
    (eq: boolean) => {
      if (muted || phase !== 'playing' || !targetHz) return
      playEqTrainingSound(targetHz, eq)
    },
    [muted, phase, targetHz]
  )

  const startStage = useCallback(() => {
    const hz = pickRandomSpectrumHz()
    setTargetHz(hz)
    setFeedback(null)
    setHighlightHz(null)
    setRevealed(false)
    setEqOn(true)
  }, [])

  const startGame = useCallback(() => {
    setPhase('playing')
    setStage(1)
    setScore(0)
    setLives(EAR_FREQ_GAME_LIVES)
    startStage()
  }, [startStage])

  useEffect(() => {
    if (phase !== 'playing' || !targetHz || muted) return
    playEqTrainingSound(targetHz, eqOn)
  }, [targetHz, phase, muted])

  useEffect(() => {
    if (phase !== 'playing' || !targetHz || muted) return
    playEqTrainingSound(targetHz, eqOn)
  }, [eqOn])

  useEffect(() => () => stopEarLabAudio(), [])

  const finishGame = useCallback(
    (finalScore: number, won: boolean) => {
      stopEarLabAudio()
      const progress = frequencyGameScoreToProgress(finalScore)
      saveEarLabScore('frequency', progress)
      setPhase(won ? 'won' : 'over')
    },
    []
  )

  const handleBandPick = (hz: number) => {
    if (phase !== 'playing' || feedback || !targetHz) return
    stopEarLabAudio()

    const correct = nearestSpectrumHz(targetHz) === nearestSpectrumHz(hz)
    setHighlightHz(hz)
    setRevealed(true)

    if (correct) {
      setFeedback('correct')
      const nextScore = score + 1
      setScore(nextScore)

      window.setTimeout(() => {
        if (stage >= EAR_FREQ_GAME_STAGES) {
          finishGame(nextScore, true)
          return
        }
        setStage((s) => s + 1)
        startStage()
      }, 900)
    } else {
      setFeedback('wrong')
      const nextLives = lives - 1
      setLives(nextLives)

      window.setTimeout(() => {
        if (nextLives <= 0) {
          finishGame(score, false)
          return
        }
        if (stage >= EAR_FREQ_GAME_STAGES) {
          finishGame(score, false)
          return
        }
        setStage((s) => s + 1)
        startStage()
      }, 1200)
    }
  }

  if (phase === 'idle') {
    return (
      <div className="ear-freq-game ear-freq-game-idle">
        <button type="button" className="academy-ear-back" onClick={onBack}>
          ← All drills
        </button>
        <p className="ear-freq-game-tagline">
          EQ on/off · pick the boosted frequency on the spectrum · {EAR_FREQ_GAME_STAGES} stages ·{' '}
          {EAR_FREQ_GAME_LIVES} lives
        </p>
        <button type="button" className="ear-freq-game-start" onClick={startGame}>
          Start game
        </button>
      </div>
    )
  }

  if (phase === 'over' || phase === 'won') {
    const progress = frequencyGameScoreToProgress(score)
    const passed = progress >= EAR_LAB_PASS_SCORE
    return (
      <div className="ear-freq-game ear-freq-game-end">
        <p className="ear-freq-game-end-kicker">{phase === 'won' ? 'Stage clear' : 'Game over'}</p>
        <p className="ear-freq-game-end-score">
          {score}/{EAR_FREQ_GAME_STAGES} correct · saved {progress}/10
        </p>
        <p className={clsx('ear-freq-game-end-msg', passed && 'ear-freq-game-end-pass')}>
          {passed
            ? 'Counts toward Ear Lab certificate.'
            : `Need ${EAR_LAB_PASS_SCORE}/10 scaled score — try again.`}
        </p>
        <div className="ear-freq-game-end-actions">
          <button type="button" className="ear-freq-game-start" onClick={startGame}>
            Play again
          </button>
          <Link to="/academy/certificates" className="ios-btn ios-btn-ghost">
            Certificates
          </Link>
        </div>
      </div>
    )
  }

  const showTarget = revealed && targetHz > 0

  return (
    <div className="ear-freq-game">
      <header className="ear-freq-game-hud">
        <div className="ear-freq-game-hud-cell">
          <span className="ear-freq-game-hud-label">Score</span>
          <span className="ear-freq-game-hud-value">{score}</span>
        </div>
        <div className="ear-freq-game-hud-cell ear-freq-game-hud-center">
          <span className="ear-freq-game-hud-label">Stage</span>
          <span className="ear-freq-game-hud-value">
            {stage} / {EAR_FREQ_GAME_STAGES}
          </span>
        </div>
        <div className="ear-freq-game-hud-cell ear-freq-game-hud-right">
          <span className="ear-freq-game-hud-label">Lives</span>
          <span className="ear-freq-game-lives" aria-label={`${lives} lives remaining`}>
            {Array.from({ length: EAR_FREQ_GAME_LIVES }, (_, i) => (
              <span
                key={i}
                className={clsx('ear-freq-game-life', i < lives && 'ear-freq-game-life-on')}
                aria-hidden
              />
            ))}
          </span>
        </div>
      </header>

      <div className="ear-freq-game-stage">
        <div className="ear-freq-game-spectrum-wrap">
          <div className="ear-freq-game-spectrum" role="group" aria-label="Frequency spectrum">
            {EAR_SPECTRUM_HZ.map((hz, index) => {
              const isTarget = showTarget && nearestSpectrumHz(hz) === nearestSpectrumHz(targetHz)
              const isPick = highlightHz !== null && nearestSpectrumHz(hz) === nearestSpectrumHz(highlightHz)
              return (
                <button
                  key={hz}
                  type="button"
                  className={clsx(
                    'ear-freq-game-band',
                    index % 2 === 0 && 'ear-freq-game-band-alt',
                    isTarget && 'ear-freq-game-band-target',
                    isPick && feedback === 'correct' && 'ear-freq-game-band-correct',
                    isPick && feedback === 'wrong' && 'ear-freq-game-band-wrong',
                    feedback && 'ear-freq-game-band-locked'
                  )}
                  disabled={!!feedback}
                  onClick={() => handleBandPick(hz)}
                  aria-label={`${formatHzLabel(hz)} band`}
                >
                  <span className="ear-freq-game-band-line" aria-hidden />
                  <span className="ear-freq-game-band-tick" aria-hidden />
                </button>
              )
            })}
          </div>
          <div className="ear-freq-game-labels">
            {EAR_SPECTRUM_HZ.map((hz) => (
              <span key={`label-${hz}`} className="ear-freq-game-label">
                {formatHzLabel(hz)}
              </span>
            ))}
          </div>
        </div>

        <div className="ear-freq-game-center">
          {showTarget ? (
            <p className="ear-freq-game-target-hz">{Math.round(targetHz)} Hz</p>
          ) : (
            <p className="ear-freq-game-target-hint">
              {eqOn ? 'EQ on — find the boost' : 'EQ off — reference'}
            </p>
          )}
          {feedback === 'correct' && <p className="ear-freq-game-flash ear-freq-game-flash-ok">Correct</p>}
          {feedback === 'wrong' && (
            <p className="ear-freq-game-flash ear-freq-game-flash-bad">
              Wrong — {Math.round(targetHz)} Hz
            </p>
          )}
        </div>
      </div>

      <footer className="ear-freq-game-controls">
        <button
          type="button"
          className="ear-freq-game-icon-btn"
          title="Replay with current EQ setting"
          onClick={() => playCurrent(eqOn)}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
            <path
              fill="currentColor"
              d="M4 18h2v-2H4v2zm0-4h2v-2H4v2zm0-4h2V8H4v2zm4 8h12v-2H8v2zm0-4h12v-2H8v2zm0-4h12V8H8v2z"
            />
          </svg>
        </button>

        <div className="ear-freq-game-eq-toggle" role="group" aria-label="EQ bypass">
          <button
            type="button"
            className={clsx('ear-freq-game-eq-btn', !eqOn && 'ear-freq-game-eq-active')}
            onClick={() => setEqOn(false)}
          >
            EQ Off
          </button>
          <button
            type="button"
            className={clsx('ear-freq-game-eq-btn', eqOn && 'ear-freq-game-eq-active')}
            onClick={() => setEqOn(true)}
          >
            EQ On
            {eqOn && <span className="ear-freq-game-eq-dot" aria-hidden />}
          </button>
        </div>

        <div className="ear-freq-game-icon-group">
          <button
            type="button"
            className="ear-freq-game-icon-btn"
            title="Replay"
            onClick={() => playCurrent(eqOn)}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
              <path
                fill="currentColor"
                d="M12 3a9 9 0 0 0-8.94 6.3H1.5l3.88 3.88L9.26 6.3H6.32A7 7 0 1 1 5 12H3a9 9 0 0 0 9-9z"
              />
            </svg>
          </button>
          <button
            type="button"
            className={clsx('ear-freq-game-icon-btn', muted && 'ear-freq-game-icon-muted')}
            title={muted ? 'Unmute' : 'Mute'}
            onClick={() => {
              if (!muted) stopEarLabAudio()
              setMuted((m) => !m)
            }}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
              {muted ? (
                <path
                  fill="currentColor"
                  d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.94-.86 1.55-2.01 1.55-3.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.43-.3 2.77-1 3.88-1.98L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z"
                />
              ) : (
                <path
                  fill="currentColor"
                  d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71v-2.07c-2.89-.86-5-3.54-5-6.71h-2.07z"
                />
              )}
            </svg>
          </button>
        </div>
      </footer>

      <button type="button" className="academy-ear-back ear-freq-game-exit" onClick={onBack}>
        Exit drill
      </button>
    </div>
  )
}
