import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { motion } from 'framer-motion'

interface LoadingTransmissionProps {
  /** Full viewport hell mode vs compact section */
  variant?: 'hell' | 'compact'
}

const SCIENCE_LINES = [
  'QUANTIZING PHASE DISTORTION',
  'SPECTRAL ANALYSIS // 440Hz NULL',
  'NEURAL LATENCY 0.003ms',
  'HARMONIC COLLAPSE DETECTED',
  'SUB-BASS SINGULARITY FORMING',
  'ARCHIVE BREACH IMMINENT',
  'DECODING UNDERGROUND FREQUENCY',
  'ROLLING STONE PROTOCOL: OVERRIDDEN',
]

export function LoadingTransmission({ variant = 'hell' }: LoadingTransmissionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const coreRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const [lineIndex, setLineIndex] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setLineIndex((i) => (i + 1) % SCIENCE_LINES.length)
      setProgress((p) => (p >= 97 ? 12 : p + Math.random() * 9 + 4))
    }, 420)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId = 0
    const particles: {
      angle: number
      radius: number
      speed: number
      size: number
      hue: number
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

    for (let i = 0; i < 120; i++) {
      particles.push({
        angle: Math.random() * Math.PI * 2,
        radius: 80 + Math.random() * 200,
        speed: 0.008 + Math.random() * 0.02,
        size: 1 + Math.random() * 2.5,
        hue: Math.random() > 0.5 ? 220 : 350,
      })
    }

    const draw = () => {
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      ctx.clearRect(0, 0, w, h)
      const cx = w / 2
      const cy = h / 2

      particles.forEach((p) => {
        p.angle += p.speed
        p.radius *= 0.998
        if (p.radius < 20) {
          p.radius = 120 + Math.random() * 180
          p.angle = Math.random() * Math.PI * 2
        }
        const x = cx + Math.cos(p.angle) * p.radius
        const y = cy + Math.sin(p.angle) * p.radius * 0.85
        const alpha = 1 - p.radius / 280
        ctx.beginPath()
        ctx.arc(x, y, p.size, 0, Math.PI * 2)
        ctx.fillStyle =
          p.hue === 220
            ? `rgba(61, 124, 255, ${alpha * 0.9})`
            : `rgba(212, 0, 0, ${alpha * 0.85})`
        ctx.fill()
      })

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
          scale: 1.15,
          duration: 0.6,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        })
      }
      if (ringRef.current) {
        gsap.to(ringRef.current, {
          rotation: 360,
          duration: 8,
          repeat: -1,
          ease: 'none',
        })
      }
      if (textRef.current) {
        gsap.fromTo(
          textRef.current,
          { opacity: 0.4, letterSpacing: '0.5em' },
          {
            opacity: 1,
            letterSpacing: '0.65em',
            duration: 0.8,
            repeat: -1,
            yoyo: true,
            ease: 'power2.inOut',
          }
        )
      }
    })
    return () => ctx.revert()
  }, [])

  const isHell = variant === 'hell'

  return (
    <div
      className={
        isHell
          ? 'fixed inset-0 z-[10001] flex items-center justify-center overflow-hidden bg-void'
          : 'relative flex items-center justify-center min-h-[50vh] w-full overflow-hidden bg-void/95 py-20'
      }
      role="status"
      aria-label="Loading transmission"
    >
      {/* Binary rain columns */}
      {isHell && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30" aria-hidden>
          {Array.from({ length: 8 }).map((_, col) => (
            <div
              key={col}
              className="absolute top-0 text-[10px] font-mono text-neon/40 leading-tight hell-loader-rain whitespace-pre"
              style={{
                left: `${8 + col * 12}%`,
                animationDelay: `${col * 0.4}s`,
              }}
            >
              {Array.from({ length: 40 })
                .map(() => (Math.random() > 0.5 ? '1' : '0'))
                .join('\n')}
            </div>
          ))}
        </div>
      )}

      {/* Hell layers */}
      <div className="absolute inset-0 hell-loader-vortex" />
      <div className="absolute inset-0 hell-loader-scanlines pointer-events-none" />
      <div className="absolute inset-0 hell-loader-grid opacity-40" />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-90"
        aria-hidden
      />

      {/* Corner HUD */}
      {isHell && (
        <>
          <div className="absolute top-6 left-6 text-[9px] tracking-[0.4em] text-neon/70 uppercase font-bold z-10">
            IOS // Hell Protocol v9
          </div>
          <div className="absolute top-6 right-6 text-[9px] tracking-[0.4em] text-mh-red/80 uppercase z-10 text-right">
            Classified
            <br />
            Do Not Blink
          </div>
        </>
      )}

      {/* Core reactor */}
      <div className="relative z-10 flex flex-col items-center">
        <div ref={ringRef} className="absolute w-[280px] h-[280px] md:w-[360px] md:h-[360px]">
          <svg viewBox="0 0 200 200" className="w-full h-full animate-pulse">
            <circle
              cx="100"
              cy="100"
              r="95"
              fill="none"
              stroke="rgba(61,124,255,0.25)"
              strokeWidth="0.5"
              strokeDasharray="4 8"
            />
            <circle
              cx="100"
              cy="100"
              r="75"
              fill="none"
              stroke="rgba(212,0,0,0.4)"
              strokeWidth="1"
              strokeDasharray="12 6"
            />
            <polygon
              points="100,15 110,95 100,85 90,95"
              fill="rgba(61,124,255,0.3)"
            />
            <polygon
              points="100,185 90,105 100,115 110,105"
              fill="rgba(139,21,56,0.5)"
            />
          </svg>
        </div>

        <div
          ref={coreRef}
          className="relative w-32 h-32 md:w-44 md:h-44 rounded-full hell-loader-core flex items-center justify-center"
        >
          <div className="absolute inset-2 rounded-full border border-neon/40 animate-spin" style={{ animationDuration: '3s' }} />
          <div
            className="absolute inset-0 rounded-full border-2 border-mh-red/60"
            style={{
              boxShadow:
                '0 0 60px rgba(61,124,255,0.5), 0 0 120px rgba(212,0,0,0.35), inset 0 0 40px rgba(0,0,0,0.8)',
            }}
          />
          <span className="font-display text-2xl md:text-4xl font-black text-signal z-10 mix-blend-difference">
            IOS
          </span>
        </div>

        {/* Frequency bars */}
        <div className="flex items-end justify-center gap-1 mt-10 h-16">
          {Array.from({ length: 24 }).map((_, i) => (
            <motion.div
              key={i}
              className="w-1 md:w-1.5 bg-gradient-to-t from-mh-red via-neon to-transparent origin-bottom"
              animate={{
                height: [8, 12 + Math.random() * 48, 6, 20 + Math.random() * 36, 10],
              }}
              transition={{
                duration: 0.4 + (i % 5) * 0.08,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        <div ref={textRef} className="mt-8 text-center px-4">
          <p className="text-[10px] md:text-xs tracking-[0.5em] text-neon uppercase font-bold hell-loader-glitch">
            Receiving Transmission
          </p>
          <p className="font-display text-lg md:text-2xl font-extrabold uppercase mt-3 text-signal hell-loader-glitch-slow">
            DECODING THE SIGNAL
          </p>
        </div>

        <motion.p
          key={lineIndex}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-[9px] md:text-[10px] tracking-[0.25em] text-muted uppercase max-w-md text-center font-mono"
        >
          {`> ${SCIENCE_LINES[lineIndex]}`}
        </motion.p>

        {/* Progress */}
        <div className="mt-8 w-64 md:w-80 h-1 bg-border overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-mh-red via-neon to-mh-red"
            animate={{ width: [`${progress}%`, `${Math.min(progress + 8, 100)}%`] }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <p className="mt-2 text-[9px] tracking-widest text-mh-red tabular-nums">
          {Math.floor(progress)}% // SINGULARITY LOAD
        </p>
      </div>

      {isHell && (
        <div className="absolute bottom-6 left-0 right-0 flex justify-between px-6 md:px-12 text-[8px] tracking-[0.35em] text-muted/60 uppercase z-10">
          <span>◉ Musicians: evacuate</span>
          <span>◉ Scientists: we warned you</span>
          <span>◉ Magazines: obsolete</span>
        </div>
      )}
    </div>
  )
}
