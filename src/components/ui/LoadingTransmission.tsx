import { useEffect, useMemo, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { motion } from 'framer-motion'

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

export function LoadingTransmission({ variant = 'hell' }: LoadingTransmissionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const coreRef = useRef<HTMLDivElement>(null)
  const pentagramRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const [lineIndex, setLineIndex] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setLineIndex((i) => (i + 1) % METAL_LINES.length)
      setProgress((p) => (p >= 96 ? 4 : p + Math.random() * 11 + 3))
    }, 380)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId = 0
    const particles: {
      x: number
      y: number
      vx: number
      vy: number
      life: number
      size: number
      tone: number
    }[] = []

    const dpr = window.devicePixelRatio || 1
    const resize = () => {
      const { offsetWidth: w, offsetHeight: h } = canvas
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const spawn = (w: number, h: number) => {
      const edge = Math.floor(Math.random() * 4)
      let x = w / 2
      let y = h / 2
      if (edge === 0) {
        x = Math.random() * w
        y = -10
      } else if (edge === 1) {
        x = w + 10
        y = Math.random() * h
      } else if (edge === 2) {
        x = Math.random() * w
        y = h + 10
      } else {
        x = -10
        y = Math.random() * h
      }
      const cx = w / 2
      const cy = h / 2
      const angle = Math.atan2(cy - y, cx - x)
      const speed = 2 + Math.random() * 4
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        size: 1 + Math.random() * 3,
        tone: Math.random(),
      })
    }

    const draw = () => {
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      ctx.fillStyle = 'rgba(5, 5, 5, 0.12)'
      ctx.fillRect(0, 0, w, h)

      if (particles.length < 90 && Math.random() > 0.55) spawn(w, h)

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy
        p.life -= 0.008
        if (p.life <= 0) {
          particles.splice(i, 1)
          continue
        }
        const ash = p.tone < 0.35
        ctx.beginPath()
        ctx.moveTo(p.x - p.size * 2, p.y)
        ctx.lineTo(p.x + p.size * 2, p.y)
        ctx.strokeStyle = ash
          ? `rgba(120, 120, 120, ${p.life * 0.7})`
          : `rgba(212, 0, 0, ${p.life * 0.95})`
        ctx.lineWidth = p.size
        ctx.stroke()
      }

      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (coreRef.current) {
        gsap.to(coreRef.current, {
          scale: 1.08,
          duration: 0.12,
          repeat: -1,
          yoyo: true,
          ease: 'power4.inOut',
        })
      }
      if (pentagramRef.current) {
        gsap.to(pentagramRef.current, {
          rotation: -360,
          duration: 22,
          repeat: -1,
          ease: 'none',
        })
      }
      if (titleRef.current) {
        gsap.fromTo(
          titleRef.current,
          { skewX: -6, scaleX: 1.02 },
          {
            skewX: -10,
            scaleX: 1.06,
            duration: 0.15,
            repeat: -1,
            yoyo: true,
            ease: 'steps(2)',
          }
        )
      }
    })
    return () => ctx.revert()
  }, [])

  const isHell = variant === 'hell'

  const slashColumns = useMemo(
    () =>
      Array.from({ length: 10 }, (_, col) =>
        Array.from({ length: 28 }, (_, row) => SLASH_CHARS[(col * 7 + row * 3) % SLASH_CHARS.length]).join(
          '\n'
        )
      ),
    []
  )

  return (
    <div
      className={
        isHell
          ? 'fixed inset-0 z-[10001] flex items-center justify-center overflow-hidden bg-[#030303]'
          : 'relative flex items-center justify-center min-h-[50vh] w-full overflow-hidden bg-[#030303]/98 py-20'
      }
      role="status"
      aria-label="Loading metal transmission"
    >
      {/* Slash / rune columns */}
      {isHell && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-25" aria-hidden>
          {Array.from({ length: 10 }).map((_, col) => (
            <div
              key={col}
              className="absolute top-0 text-sm font-bold text-mh-red/50 leading-none metal-loader-slashes select-none"
              style={{
                left: `${4 + col * 10}%`,
                animationDelay: `${col * 0.25}s`,
              }}
            >
              {slashColumns[col]}
            </div>
          ))}
        </div>
      )}

      <div className="absolute inset-0 metal-loader-smoke" />
      <div className="absolute inset-0 metal-loader-vignette pointer-events-none" />
      <div className="absolute inset-0 metal-loader-scanlines pointer-events-none" />
      <div className="absolute inset-0 metal-loader-scratches opacity-50" />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-80" aria-hidden />

      {isHell && (
        <>
          <div className="absolute top-6 left-6 z-10 border-l-2 border-mh-red pl-3">
            <p className="text-[9px] tracking-[0.45em] text-mh-red uppercase font-bold">
              Institute of Sound
            </p>
            <p className="text-[8px] tracking-[0.3em] text-muted/80 uppercase mt-1">
              Molten Channel // Live
            </p>
          </div>
          <div className="absolute top-6 right-6 z-10 text-right border-r-2 border-mh-red pr-3">
            <p className="text-[9px] tracking-[0.4em] text-signal/90 uppercase font-bold">
              Stage II
            </p>
            <p className="text-[8px] tracking-[0.3em] text-mh-red uppercase mt-1">
              All Clean Tones Dead
            </p>
          </div>
        </>
      )}

      <div className="relative z-10 flex flex-col items-center">
        <div
          ref={pentagramRef}
          className="absolute w-[300px] h-[300px] md:w-[400px] md:h-[400px] metal-loader-pentagram"
        >
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <polygon
              points="100,18 118,75 178,75 130,112 148,170 100,138 52,170 70,112 22,75 82,75"
              fill="none"
              stroke="rgba(212,0,0,0.35)"
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
            <circle
              cx="100"
              cy="100"
              r="68"
              fill="none"
              stroke="rgba(212,0,0,0.2)"
              strokeWidth="0.5"
            />
          </svg>
        </div>

        <div
          ref={coreRef}
          className="relative w-36 h-36 md:w-48 md:h-48 metal-loader-core flex items-center justify-center"
        >
          <div className="absolute inset-0 metal-loader-core-ring" />
          <div className="absolute inset-3 border border-mh-red/50 metal-loader-core-inner" />
          <span className="font-display text-3xl md:text-5xl font-black text-signal z-10 tracking-tighter metal-loader-logo">
            IOS
          </span>
        </div>

        <div className="flex items-end justify-center gap-0.5 md:gap-1 mt-12 h-20 px-2">
          {Array.from({ length: 32 }).map((_, i) => (
            <motion.div
              key={i}
              className="w-1 md:w-1.5 bg-gradient-to-t from-[#1a1a1a] via-mh-red to-[#ff2a2a] origin-bottom metal-loader-bar"
              animate={{
                height: [
                  4,
                  i % 3 === 0 ? 56 + Math.random() * 24 : 12 + Math.random() * 20,
                  6,
                  i % 2 === 0 ? 40 + Math.random() * 16 : 8,
                  4,
                ],
              }}
              transition={{
                duration: 0.08 + (i % 4) * 0.02,
                repeat: Infinity,
                ease: 'linear',
                times: [0, 0.15, 0.3, 0.5, 1],
              }}
            />
          ))}
        </div>

        <div className="mt-10 text-center px-4">
          <p className="text-[9px] md:text-[10px] tracking-[0.55em] text-mh-red uppercase font-bold metal-loader-stutter">
            Underground Feed
          </p>
          <h2
            ref={titleRef}
            className="font-display text-xl md:text-3xl font-black uppercase mt-4 text-signal metal-loader-title"
          >
            FORGING THE RIFF
          </h2>
        </div>

        <motion.p
          key={lineIndex}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.08 }}
          className="mt-5 text-[9px] md:text-[10px] tracking-[0.3em] text-muted uppercase max-w-md text-center font-mono"
        >
          {`† ${METAL_LINES[lineIndex]}`}
        </motion.p>

        <div className="mt-10 w-72 md:w-96 h-2 bg-[#1a1a1a] border border-mh-red/30 overflow-hidden">
          <motion.div
            className="h-full metal-loader-progress"
            animate={{ width: [`${progress}%`, `${Math.min(progress + 6, 100)}%`] }}
            transition={{ duration: 0.12, ease: 'linear' }}
          />
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
