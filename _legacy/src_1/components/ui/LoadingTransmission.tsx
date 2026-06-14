import { useEffect, useMemo, useState } from 'react'
import { IosBrandMarkSvg } from '@/components/brand/IosBrandMarkSvg'

interface LoadingTransmissionProps {
  variant?: 'hell' | 'compact'
}

const METAL_LINES = [
  'DROP C // 7-STRING LOCKED',
  'BLAST BEAT BUFFER OVERFLOW',
  'DISTORTION CLIPPING AT 11',
  'DOUBLE BASS PATTERN ENGAGED',
  'MOSH PIT PROTOCOL ACTIVE',
  'FORGING UNDERGROUND RIFF',
  'TREMOLO PICKING SINGULARITY',
  'DOOM FREQUENCY // NO CLEAN TONES',
]

const SLASH_CHARS = ['╳', '†', '▲', '⨯', '§', 'ǁ', '╬', '☠']
const EQ_BARS = 24

export function LoadingTransmission({ variant = 'hell' }: LoadingTransmissionProps) {
  const [lineIndex, setLineIndex] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setLineIndex((i) => (i + 1) % METAL_LINES.length)
      setProgress((p) => (p >= 96 ? 4 : p + Math.random() * 11 + 3))
    }, 480)
    return () => clearInterval(id)
  }, [])

  const isHell = variant === 'hell'

  const slashColumns = useMemo(
    () =>
      Array.from({ length: 6 }, (_, col) =>
        Array.from({ length: 22 }, (_, row) => SLASH_CHARS[(col * 7 + row * 3) % SLASH_CHARS.length]).join(
          '\n'
        )
      ),
    []
  )

  return (
    <div
      className={
        isHell
          ? 'fixed inset-0 z-[10001] flex items-center justify-center overflow-hidden bg-void'
          : 'relative flex items-center justify-center min-h-[50vh] w-full overflow-hidden bg-void/98 py-20'
      }
      role="status"
      aria-label="Loading metal transmission"
    >
      {isHell && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20" aria-hidden>
          {slashColumns.map((col, i) => (
            <div
              key={i}
              className="absolute top-0 text-sm font-bold text-mh-red/50 leading-none metal-loader-slashes select-none"
              style={{
                left: `${6 + i * 16}%`,
                animationDelay: `${i * 0.3}s`,
              }}
            >
              {col}
            </div>
          ))}
        </div>
      )}

      <div className="absolute inset-0 metal-loader-smoke" />
      <div className="absolute inset-0 metal-loader-vignette pointer-events-none" />
      <div className="absolute inset-0 metal-loader-scanlines pointer-events-none perf-lite-hide" />
      <div className="absolute inset-0 metal-loader-scratches opacity-40" />

      {isHell && (
        <>
          <div className="absolute top-6 left-6 z-10">
            <IosBrandMarkSvg className="metal-loader-brand-mark h-8 w-auto max-w-[10rem]" animated />
            <p className="text-[8px] tracking-[0.3em] text-muted/80 uppercase mt-2 border-l-2 border-mh-red pl-2">
              Molten Channel // Live
            </p>
          </div>
          <div className="absolute top-6 right-6 z-10 text-right border-r-2 border-mh-red pr-3">
            <p className="text-[9px] tracking-[0.4em] text-signal/90 uppercase font-bold">Stage II</p>
            <p className="text-[8px] tracking-[0.3em] text-mh-red uppercase mt-1">
              All Clean Tones Dead
            </p>
          </div>
        </>
      )}

      <div className="relative z-10 flex flex-col items-center">
        <div className="absolute w-[300px] h-[300px] md:w-[400px] md:h-[400px] metal-loader-pentagram metal-loader-pentagram-spin">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <polygon
              points="100,18 118,75 178,75 130,112 148,170 100,138 52,170 70,112 22,75 82,75"
              fill="none"
              stroke="var(--color-mh-red)"
              strokeOpacity="0.35"
              strokeWidth="1.2"
            />
            <circle
              cx="100"
              cy="100"
              r="88"
              fill="none"
              stroke="rgba(40,40,40,0.8)"
              strokeWidth="2"
              strokeDasharray="2 14"
            />
          </svg>
        </div>

        <div className="relative w-36 h-36 md:w-48 md:h-48 metal-loader-core metal-loader-core-beat flex items-center justify-center">
          <div className="absolute inset-0 metal-loader-core-ring" />
          <div className="absolute inset-3 border border-mh-red/50 metal-loader-core-inner" />
          <IosBrandMarkSvg
            className="relative z-10 w-[78%] max-w-[8.5rem] h-auto metal-loader-brand-mark"
            animated
          />
        </div>

        <div className="flex items-end justify-center gap-0.5 md:gap-1 mt-12 h-20 px-2 metal-loader-eq">
          {Array.from({ length: EQ_BARS }).map((_, i) => (
            <div
              key={i}
              className="metal-loader-eq-bar w-1 md:w-1.5 bg-gradient-to-t from-elevated via-mh-red to-rs-red origin-bottom"
              style={{
                animationDelay: `${(i % 8) * 0.06}s`,
                animationDuration: `${0.22 + (i % 4) * 0.05}s`,
              }}
            />
          ))}
        </div>

        <div className="mt-10 text-center px-4">
          <p className="text-[9px] md:text-[10px] tracking-[0.55em] text-mh-red uppercase font-bold metal-loader-stutter">
            Underground Feed
          </p>
          <h2 className="font-display text-xl md:text-3xl font-black uppercase mt-4 text-signal metal-loader-title">
            FORGING THE RIFF
          </h2>
        </div>

        <p
          key={lineIndex}
          className="mt-5 text-[9px] md:text-[10px] tracking-[0.3em] text-muted uppercase max-w-md text-center font-mono metal-loader-line-fade"
        >
          {`† ${METAL_LINES[lineIndex]}`}
        </p>

        <div className="mt-10 w-72 md:w-96 h-2 bg-elevated border border-mh-red/30 overflow-hidden">
          <div className="h-full metal-loader-progress transition-[width] duration-150 ease-linear" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-3 text-[9px] tracking-[0.4em] text-mh-red tabular-nums uppercase font-bold">
          {Math.floor(progress)}% // MOLTEN LOAD
        </p>
      </div>

      {isHell && (
        <div className="absolute bottom-6 left-0 right-0 flex flex-wrap justify-center gap-x-8 gap-y-1 px-6 text-[8px] tracking-[0.4em] text-muted/50 uppercase z-10">
          <span>Drop C</span>
          <span>BPM 220</span>
          <span>No Pop</span>
          <span>Only Riff</span>
        </div>
      )}
    </div>
  )
}
