import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { HeroData } from '@/types'
import { WaveformBackground } from '@/components/effects/WaveformBackground'

interface HeroSectionProps {
  data: HeroData
}

export function HeroSection({ data }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-void">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(ellipse at 50% 0%, rgba(212,0,0,0.18) 0%, transparent 60%)',
          }}
        />
        <WaveformBackground />
      </div>

      <div className="relative z-10 text-center px-6 max-w-5xl">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 1 }}
          className="text-[10px] md:text-xs tracking-[0.4em] text-neon uppercase"
        >
          {data.tagline}
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tighter mt-6 glitch-text"
          data-text={data.title}
        >
          {data.title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="text-muted text-lg md:text-xl mt-6 max-w-xl mx-auto"
        >
          {data.subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 1 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mt-12"
        >
          <Link
            to={data.ctaPrimary.href}
            className="bg-neon text-void px-8 py-4 text-xs tracking-[0.2em] uppercase font-bold hover:bg-signal transition-colors"
          >
            {data.ctaPrimary.label}
          </Link>
          <Link
            to={data.ctaSecondary.href}
            className="border border-signal/30 px-8 py-4 text-xs tracking-[0.2em] uppercase hover:border-neon hover:text-neon transition-all"
          >
            {data.ctaSecondary.label}
          </Link>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] tracking-widest text-muted uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-px h-8 bg-neon/50"
        />
      </motion.div>
    </section>
  )
}
