import type { CoverStory } from '@/types'
import { WaveformBackground } from '@/components/effects/WaveformBackground'
import { Reveal } from '@/components/ui/Reveal'
import { MetalButton } from '@/components/ui/MetalButton'
import { MetalBadge } from '@/components/ui/MetalBadge'
import { getPerformanceProfile } from '@/lib/performance'

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
  const lite = getPerformanceProfile() === 'lite'

  return (
    <section className="relative min-h-screen overflow-hidden bg-void pt-20 md:pt-24">
      <div className="absolute inset-0 hero-grid opacity-60" />
      <div className="absolute inset-0 hero-scanlines pointer-events-none" />
      <WaveformBackground className="opacity-50" />

      <div
        className="absolute top-0 right-0 w-1/2 h-full opacity-40 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 70% 40%, rgba(212,0,0,0.22), transparent 55%), radial-gradient(ellipse at 90% 80%, rgba(139,21,56,0.25), transparent 50%)',
        }}
      />

      {/* Vertical transmission rail */}
      <div className="absolute left-4 md:left-8 top-28 bottom-8 hidden md:flex flex-col justify-between z-20 pointer-events-none">
        <span
          className="text-[10px] tracking-[0.5em] text-mh-red/80 uppercase [writing-mode:vertical-rl] rotate-180"
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
                <span className="text-mh-red mx-6">◆</span>
              </span>
            ))}
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-4 section-padding pb-8 pt-10 md:pt-14 items-end">
          {/* Left — IOS identity + headline */}
          <div className="lg:col-span-7 flex flex-col justify-end">
            <Reveal className="flex flex-wrap items-center gap-3 mb-6">
              <MetalBadge variant="live">Live Signal</MetalBadge>
              <MetalBadge variant="crimson">{story.category}</MetalBadge>
            </Reveal>

            <Reveal delay={0.1} className="font-display text-xs md:text-sm tracking-[0.45em] text-muted uppercase mb-3">
              Institute of Sound presents
            </Reveal>

            <Reveal delay={0.15}>
              <h1 className="font-metal text-4xl sm:text-5xl md:text-6xl xl:text-8xl text-signal hero-glitch-shadow">
                {story.headline}
              </h1>
            </Reveal>

            <Reveal delay={0.2} className="mt-8 metal-quote-border max-w-xl">
              <p className="font-serif text-lg md:text-xl text-signal/90 leading-relaxed italic">
                {story.dek}
              </p>
            </Reveal>

            <Reveal delay={0.25} className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] tracking-[0.2em] uppercase text-muted">
              <span>
                Archivist <span className="text-signal">{story.author}</span>
              </span>
              <span className="hidden sm:inline text-border">|</span>
              <time>{story.date}</time>
              <span className="hidden sm:inline text-border">|</span>
              <span className="text-mh-red/80">Encrypted Feature</span>
            </Reveal>

            <Reveal delay={0.3} className="mt-10 flex flex-wrap gap-4">
              <MetalButton to={`/feature/${story.slug}`} variant="primary">
                {story.readLabel} →
              </MetalButton>
              <MetalButton to="/discover" variant="outline">
                Enter Archive
              </MetalButton>
            </Reveal>
          </div>

          {/* Right — brutalist image panel */}
          <Reveal delay={0.2} className="lg:col-span-5 relative">
            <div className="relative">
              <div className="absolute -inset-3 border border-mh-red/25 pointer-events-none" />
              <div className="absolute top-4 -left-3 w-full h-full border border-crimson/30 pointer-events-none hidden lg:block" />

              <div className="relative hero-image-frame overflow-hidden aspect-[4/5] md:aspect-[3/4] lg:aspect-[4/5]">
                <img
                  src={story.image}
                  alt=""
                  className="w-full h-full object-cover scale-105 hover:scale-100 transition-transform duration-[1.2s]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-void via-void/20 to-transparent" />
                <div className="absolute inset-0 mix-blend-overlay opacity-30 bg-mh-red/15" />

                {/* HUD corners */}
                <span className="absolute top-3 left-3 text-[9px] tracking-widest text-mh-red uppercase font-bold">
                  IOS // Visual
                </span>
                <span className="absolute bottom-3 right-3 text-[9px] tracking-widest text-signal/60 uppercase">
                  Ref. {story.slug.slice(0, 12)}
                </span>
              </div>

              {/* Floating stat card */}
              <div className="absolute -bottom-4 -left-4 md:-left-8 bg-void border border-border p-4 min-w-[140px] shadow-[0_0_40px_-10px_rgba(212,0,0,0.35)]">
                <p className="text-[9px] tracking-[0.3em] text-mh-red uppercase font-bold">
                  Now Broadcasting
                </p>
                <p className="font-display text-2xl font-bold mt-1 tabular-nums">24/7</p>
                <p className="text-[10px] text-muted mt-1">Underground only</p>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Bottom status bar */}
        <Reveal delay={0.35} className="border-t border-border px-6 md:px-12 lg:px-16 py-4 flex flex-wrap justify-between gap-4 text-[10px] tracking-[0.2em] uppercase text-muted">
          <span>Frequency locked</span>
          <span className="text-mh-red">◉ Signal stable</span>
          <span>Scroll to decode</span>
        </Reveal>
      </div>

      {!lite && (
        <div className="absolute bottom-24 right-8 hidden lg:flex flex-col items-center gap-2 z-20">
          <div className="hero-scroll-line w-px bg-gradient-to-b from-transparent via-mh-red to-transparent" />
        </div>
      )}
    </section>
  )
}
