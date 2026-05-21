import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { CoverStory } from '@/types'
import { WaveformBackground } from '@/components/effects/WaveformBackground'

interface CoverHeroSectionProps {
  story: CoverStory
}

const marqueeItems = [
  'UNDERGROUND ARCHIVE',
  'MIDNIGHT FREQUENCIES',
  'NOISE RITUAL',
  'DARK SIGNAL',
  'INSTITUTE OF SOUND',
  'GLOBAL TRANSMISSION',
]

export function CoverHeroSection({ story }: CoverHeroSectionProps) {
  return (
    <section className="relative min-h-screen overflow-hidden bg-void pt-20 md:pt-24">
      <div className="absolute inset-0 hero-grid opacity-60" />
      <div className="absolute inset-0 hero-scanlines pointer-events-none" />
      <WaveformBackground className="opacity-50" />

      <div
        className="absolute top-0 right-0 w-1/2 h-full opacity-40 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 70% 40%, rgba(61,124,255,0.25), transparent 55%), radial-gradient(ellipse at 90% 80%, rgba(139,21,56,0.2), transparent 50%)',
        }}
      />

      {/* Vertical transmission rail */}
      <div className="absolute left-4 md:left-8 top-28 bottom-8 hidden md:flex flex-col justify-between z-20 pointer-events-none">
        <span
          className="text-[10px] tracking-[0.5em] text-neon/80 uppercase [writing-mode:vertical-rl] rotate-180"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Transmission 001
        </span>
        <span className="text-[10px] tracking-[0.4em] text-muted uppercase [writing-mode:vertical-rl] rotate-180">
          Est. Underground 2026
        </span>
      </div>

      <div className="relative z-10 min-h-[calc(100vh-5rem)] flex flex-col">
        {/* Top marquee */}
        <div className="overflow-hidden border-y border-border/80 bg-void/80 backdrop-blur-sm py-2.5 mt-4">
          <div className="hero-marquee flex whitespace-nowrap gap-12">
            {[...marqueeItems, ...marqueeItems].map((item, i) => (
              <span
                key={`${item}-${i}`}
                className="text-[10px] md:text-xs tracking-[0.35em] text-muted uppercase font-medium"
              >
                {item}
                <span className="text-neon mx-6">◆</span>
              </span>
            ))}
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-4 section-padding pb-8 pt-10 md:pt-14 items-end">
          {/* Left — IOS identity + headline */}
          <div className="lg:col-span-7 flex flex-col justify-end">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-wrap items-center gap-3 mb-6"
            >
              <span className="inline-flex items-center gap-2 border border-neon/50 bg-neon/10 px-3 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-neon animate-pulse" />
                <span className="text-[10px] tracking-[0.3em] text-neon uppercase font-bold">
                  Live Signal
                </span>
              </span>
              <span className="text-[10px] tracking-[0.25em] text-crimson uppercase">
                {story.category}
              </span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="font-display text-xs md:text-sm tracking-[0.45em] text-muted uppercase mb-3"
            >
              Institute of Sound presents
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-extrabold uppercase leading-[0.92] tracking-tight hero-glitch-shadow"
            >
              {story.headline}
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
              className="mt-8 border-l-2 border-neon pl-5 max-w-xl"
            >
              <p className="font-serif text-lg md:text-xl text-signal/90 leading-relaxed italic">
                {story.dek}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] tracking-[0.2em] uppercase text-muted"
            >
              <span>
                Archivist <span className="text-signal">{story.author}</span>
              </span>
              <span className="hidden sm:inline text-border">|</span>
              <time>{story.date}</time>
              <span className="hidden sm:inline text-border">|</span>
              <span className="text-neon/80">Encrypted Feature</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="mt-10 flex flex-wrap gap-4"
            >
              <Link
                to={`/feature/${story.slug}`}
                className="group relative overflow-hidden bg-neon text-void px-8 py-3.5 text-[11px] tracking-[0.25em] uppercase font-bold"
              >
                <span className="relative z-10">{story.readLabel} →</span>
                <span className="absolute inset-0 bg-signal translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </Link>
              <Link
                to="/discover"
                className="border border-signal/25 px-8 py-3.5 text-[11px] tracking-[0.25em] uppercase text-signal/80 hover:border-neon hover:text-neon transition-colors"
              >
                Enter Archive
              </Link>
            </motion.div>
          </div>

          {/* Right — brutalist image panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative">
              <div className="absolute -inset-3 border border-neon/20 pointer-events-none" />
              <div className="absolute top-4 -left-3 w-full h-full border border-crimson/30 pointer-events-none hidden lg:block" />

              <div className="relative hero-image-frame overflow-hidden aspect-[4/5] md:aspect-[3/4] lg:aspect-[4/5]">
                <img
                  src={story.image}
                  alt=""
                  className="w-full h-full object-cover scale-105 hover:scale-100 transition-transform duration-[1.2s]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-void via-void/20 to-transparent" />
                <div className="absolute inset-0 mix-blend-overlay opacity-30 bg-neon/20" />

                {/* HUD corners */}
                <span className="absolute top-3 left-3 text-[9px] tracking-widest text-neon uppercase font-bold">
                  IOS // Visual
                </span>
                <span className="absolute bottom-3 right-3 text-[9px] tracking-widest text-signal/60 uppercase">
                  Ref. {story.slug.slice(0, 12)}
                </span>
              </div>

              {/* Floating stat card */}
              <div className="absolute -bottom-4 -left-4 md:-left-8 bg-void border border-border p-4 min-w-[140px] shadow-[0_0_40px_-10px_rgba(61,124,255,0.4)]">
                <p className="text-[9px] tracking-[0.3em] text-mh-red uppercase font-bold">
                  Now Broadcasting
                </p>
                <p className="font-display text-2xl font-bold mt-1 tabular-nums">24/7</p>
                <p className="text-[10px] text-muted mt-1">Underground only</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom status bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="border-t border-border px-6 md:px-12 lg:px-16 py-4 flex flex-wrap justify-between gap-4 text-[10px] tracking-[0.2em] uppercase text-muted"
        >
          <span>Frequency locked</span>
          <span className="text-neon">◉ Signal stable</span>
          <span>Scroll to decode</span>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-24 right-8 hidden lg:flex flex-col items-center gap-2 z-20"
      >
        <motion.div
          animate={{ height: [24, 48, 24] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-px bg-gradient-to-b from-transparent via-neon to-transparent"
        />
      </motion.div>
    </section>
  )
}
