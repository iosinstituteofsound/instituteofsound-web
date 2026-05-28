import { Link } from 'react-router-dom'
import type {
  AlbumRelease,
  CoverStory,
  Feature,
  Playlist,
  Review,
  Signal,
} from '@/types'
import { MetalBadge } from '@/components/ui/MetalBadge'
import { MagazineSectionHeading } from '@/components/ui/MagazineSectionHeading'
import { MOVEMENT_STATS, PARTNER_LOGOS, VIBES } from '@/lib/nav/sidebar'

const MARQUEE = [
  'UNDERGROUND ARCHIVE',
  'MIDNIGHT FREQUENCIES',
  'NOISE RITUAL',
  'INSTITUTE OF SOUND',
  'GLOBAL TRANSMISSION',
]

export function HomeHero({ cover }: { cover: CoverStory }) {
  return (
    <section className="relative overflow-hidden border border-border bg-surface">
      <div className="absolute inset-0 hero-grid opacity-25" />
      <div className="absolute inset-0 hero-scanlines pointer-events-none opacity-50" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 85% 50%, rgba(212,0,0,0.18), transparent 55%), radial-gradient(ellipse at 10% 80%, rgba(139,21,56,0.12), transparent 50%)',
        }}
      />

      <div className="relative border-b border-border/80 bg-void/70 py-2 backdrop-blur-sm">
        <div className="hero-marquee flex gap-10 whitespace-nowrap">
          {[...MARQUEE, ...MARQUEE].map((item, i) => (
            <span
              key={`${item}-${i}`}
              className="text-[10px] font-medium uppercase tracking-[0.35em] text-muted"
            >
              {item}
              <span className="mx-6 text-mh-red">◆</span>
            </span>
          ))}
        </div>
      </div>

      <div className="relative grid lg:grid-cols-12">
        <div className="relative z-10 p-6 sm:p-8 lg:col-span-7 lg:p-10">
          <div className="mb-5 flex flex-wrap gap-2">
            <MetalBadge variant="live">Live Signal</MetalBadge>
            <MetalBadge variant="crimson">{cover.category}</MetalBadge>
          </div>

          <p className="font-display text-[11px] font-bold uppercase tracking-[0.45em] text-muted">
            Institute of Sound presents
          </p>

          <h1 className="mt-3 font-display text-3xl font-extrabold uppercase leading-[0.92] tracking-tight text-signal sm:text-4xl lg:text-[2.75rem] xl:text-5xl">
            Culture is built,
            <br />
            <span className="text-rs-red">not posted.</span>
          </h1>

          <div className="mt-6 max-w-lg border-l-2 border-mh-red pl-5">
            <p className="font-serif text-lg italic leading-relaxed text-signal/90 md:text-xl">
              {cover.dek}
            </p>
          </div>

          <p className="mt-5 flex flex-wrap gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.2em] text-muted">
            <span>
              Archivist <span className="text-signal">{cover.author}</span>
            </span>
            <span className="text-border">|</span>
            <time>{cover.date}</time>
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to={`/feature/${cover.slug}`} className="ios-btn ios-btn-primary">
              Explore Now →
            </Link>
            <Link to="/submissions" className="ios-btn ios-btn-secondary">
              Submit Your Music
            </Link>
          </div>
        </div>

        <div className="relative lg:col-span-5">
          <div className="relative m-4 lg:m-6 lg:ml-0">
            <div className="absolute -inset-2 border border-mh-red/20 pointer-events-none" />
            <div className="hero-image-frame relative aspect-[4/3] overflow-hidden lg:aspect-[5/6]">
              <img
                src={cover.image}
                alt=""
                className="h-full w-full object-cover scale-105 transition-transform duration-[1.2s] hover:scale-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-void via-void/25 to-transparent" />
              <div className="absolute inset-0 mix-blend-overlay bg-mh-red/10 opacity-40" />
              <span className="absolute left-3 top-3 text-[9px] font-bold uppercase tracking-widest text-mh-red">
                IOS // Visual
              </span>
            </div>
            <div className="absolute -bottom-3 -left-2 border border-border bg-void p-3 shadow-[0_0_40px_-10px_rgba(212,0,0,0.35)] sm:-left-4">
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-mh-red">
                On the wire
              </p>
              <p className="font-display mt-1 text-xl font-bold text-signal">Weekly</p>
              <p className="mt-0.5 text-[10px] text-muted">Spins · tribes · scenes</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative flex flex-wrap justify-between gap-3 border-t border-border px-6 py-3 text-[10px] uppercase tracking-[0.2em] text-muted sm:px-8">
        <span>Frequency locked</span>
        <span className="text-mh-red">◉ Signal stable</span>
        <span>Scroll to decode</span>
      </div>
    </section>
  )
}

type RecommendedCard = {
  tag: string
  title: string
  subtitle: string
  image: string
  href: string
}

export function RecommendedRow({ cards }: { cards: RecommendedCard[] }) {
  return (
    <section className="section-perf">
      <MagazineSectionHeading
        kicker="Curated"
        title="Recommended For You"
        subtitle="Features, reviews, signals, and playlists — tuned to the underground."
      />
      <div className="hide-scrollbar -mx-1 flex gap-4 overflow-x-auto px-1 pb-2">
        {cards.map((card) => (
          <Link
            key={card.href + card.title}
            to={card.href}
            className="magazine-card-hover group w-[210px] shrink-0 sm:w-[230px]"
          >
            <article className="ios-card overflow-hidden">
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={card.image}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-void/90 via-transparent to-transparent" />
                <span className="absolute left-2 top-2">
                  <MetalBadge>{card.tag}</MetalBadge>
                </span>
              </div>
              <div className="relative p-4">
                <h3 className="font-display text-sm font-bold uppercase leading-snug tracking-wide text-signal line-clamp-2">
                  {card.title}
                </h3>
                <p className="mt-2 text-xs text-muted">{card.subtitle}</p>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </section>
  )
}

export function EditorsPicks({
  lead,
  items,
}: {
  lead: Feature
  items: { tag: string; title: string; date: string; image: string; href: string }[]
}) {
  return (
    <section className="section-perf">
      <MagazineSectionHeading
        kicker="Desk"
        title="Editor's Picks"
        subtitle="Long reads and scene intelligence from the editorial desk."
      />
      <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
        <Link
          to={`/feature/${lead.slug}`}
          className="magazine-card-hover group lg:col-span-7"
        >
          <article className="ios-card overflow-hidden">
            <div className="relative aspect-[16/10] overflow-hidden">
              <img
                src={lead.image}
                alt=""
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-void/80 via-transparent to-transparent" />
            </div>
            <div className="border-t border-border p-6">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-rs-red">
                {lead.category}
              </span>
              <h3 className="mt-3 font-serif text-2xl font-bold leading-tight text-signal transition-colors group-hover:text-rs-red md:text-4xl">
                {lead.title}
              </h3>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
                {lead.excerpt}
              </p>
              <p className="mt-4 text-xs text-muted">
                {lead.author} · {lead.readTime}
              </p>
              <span className="mt-5 inline-block font-display text-[11px] font-bold uppercase tracking-[0.22em] text-mh-red">
                Read Now →
              </span>
            </div>
          </article>
        </Link>

        <ul className="flex flex-col gap-4 lg:col-span-5">
          {items.map((item) => (
            <li key={item.href}>
              <Link
                to={item.href}
                className="magazine-card-hover group flex gap-4 ios-card p-3"
              >
                <div className="relative h-24 w-24 shrink-0 overflow-hidden">
                  <img
                    src={item.image}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="min-w-0 flex-1 border-l border-border/60 py-1 pl-4">
                  <MetalBadge variant="crimson">{item.tag}</MetalBadge>
                  <p className="mt-2 font-display text-sm font-bold uppercase leading-snug tracking-wide text-signal line-clamp-2">
                    {item.title}
                  </p>
                  <p className="mt-2 text-[10px] uppercase tracking-wider text-muted">{item.date}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export function LatestReleases({ releases }: { releases: AlbumRelease[] }) {
  return (
    <section id="releases" className="section-perf">
      <MagazineSectionHeading
        kicker="New Music"
        title="Latest Releases"
        subtitle="Premieres and drops across the network."
      />
      <div className="hide-scrollbar -mx-1 flex gap-4 overflow-x-auto px-1 pb-2">
        {releases.map((r) => (
          <Link
            key={r.id}
            to={r.href ?? '/discover'}
            className="magazine-card-hover group w-[150px] shrink-0 sm:w-[168px]"
          >
            <article className="ios-card p-3">
              <div className="relative overflow-hidden">
                <img
                  src={r.cover}
                  alt=""
                  className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <p className="mt-3 font-display text-xs font-bold uppercase tracking-wide text-signal line-clamp-1">
                {r.title}
              </p>
              <p className="mt-1 text-xs text-muted">{r.artist}</p>
              <p className="mt-2 text-[10px] uppercase tracking-wider text-mh-red/90">
                {r.releaseDate}
              </p>
            </article>
          </Link>
        ))}
      </div>
    </section>
  )
}

export function BrowseByVibes() {
  return (
    <section className="section-perf">
      <MagazineSectionHeading
        kicker="Mood"
        title="Browse By Vibes"
        subtitle="Find playlists and features by emotional frequency."
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {VIBES.map((v) => (
          <Link
            key={v.id}
            to={`/playlists?vibe=${v.id}`}
            className="ios-card group flex flex-col items-center px-3 py-6 text-center transition-transform hover:-translate-y-0.5"
          >
            <span className="text-3xl opacity-90 transition-transform group-hover:scale-110">
              {v.emoji}
            </span>
            <span className="mt-3 font-display text-[10px] font-bold uppercase leading-tight tracking-[0.12em] text-signal">
              {v.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}

export function MovementInNumbers() {
  return (
    <section className="section-perf ios-panel p-6 sm:p-8">
      <MagazineSectionHeading
        kicker="Network"
        title="The Movement In Numbers"
        subtitle="Underground culture scales when the signal stays true."
      />
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5 lg:pl-2">
        {MOVEMENT_STATS.map((stat) => (
          <div key={stat.label} className="border-l border-border/80 pl-4">
            <p className="font-display text-3xl font-extrabold tracking-tight text-signal sm:text-4xl">
              {stat.value}
            </p>
            <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
              {stat.label}
            </p>
            <p className="mt-1 text-xs font-semibold text-emerald-400/90">{stat.delta}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export function HomeFooterStrip() {
  return (
    <footer className="border-t border-border py-10 text-center">
      <p className="font-display text-[10px] font-bold uppercase tracking-[0.28em] text-muted">
        Powered by culture · Backed by believers
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 px-4">
        {PARTNER_LOGOS.map((name) => (
          <span
            key={name}
            className="font-display text-[11px] font-bold uppercase tracking-[0.2em] text-edge"
          >
            {name}
          </span>
        ))}
      </div>
    </footer>
  )
}

export function buildRecommendedCards(
  features: Feature[],
  reviews: Review[],
  playlists: Playlist[],
  signals: Signal[],
): RecommendedCard[] {
  const cards: RecommendedCard[] = []
  if (features[0]) {
    cards.push({
      tag: 'Featured',
      title: features[0].title,
      subtitle: features[0].author,
      image: features[0].image,
      href: `/feature/${features[0].slug}`,
    })
  }
  if (reviews[0]) {
    cards.push({
      tag: 'Review',
      title: reviews[0].album,
      subtitle: `${reviews[0].artist} · ${reviews[0].verdict}`,
      image: reviews[0].cover,
      href: `/feature/${reviews[0].slug}`,
    })
  }
  if (signals[0]) {
    cards.push({
      tag: 'Signal',
      title: signals[0].title,
      subtitle: signals[0].category,
      image:
        'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=600&q=80',
      href: '/signals',
    })
  }
  if (playlists[0]) {
    cards.push({
      tag: 'Playlist',
      title: playlists[0].title,
      subtitle: `${playlists[0].trackCount} tracks · ${playlists[0].duration}`,
      image: playlists[0].cover,
      href: `/playlist/${playlists[0].slug}`,
    })
  }
  return cards
}

export function buildEditorSideItems(
  features: Feature[],
  reviews: Review[],
  signals: Signal[],
) {
  const items: { tag: string; title: string; date: string; image: string; href: string }[] = []
  if (features[1]) {
    items.push({
      tag: 'Interview',
      title: features[1].title,
      date: 'May 2026',
      image: features[1].image,
      href: `/feature/${features[1].slug}`,
    })
  }
  if (features[2]) {
    items.push({
      tag: 'Magazine',
      title: features[2].title,
      date: 'May 2026',
      image: features[2].image,
      href: `/feature/${features[2].slug}`,
    })
  }
  if (reviews[1]) {
    items.push({
      tag: 'Review',
      title: `${reviews[1].album}`,
      date: reviews[1].verdict,
      image: reviews[1].cover,
      href: `/feature/${reviews[1].slug}`,
    })
  }
  if (items.length < 3 && signals[0]) {
    items.push({
      tag: 'Signal',
      title: signals[0].title,
      date: signals[0].timestamp,
      image:
        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80',
      href: '/signals',
    })
  }
  return items.slice(0, 3)
}

export function LoadingHome() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8">
      <div className="h-px w-24 bg-gradient-to-r from-transparent via-mh-red to-transparent" />
      <p className="font-display text-[11px] uppercase tracking-[0.35em] text-muted animate-pulse">
        Tuning transmission…
      </p>
    </div>
  )
}

export function HomeError() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center p-8 text-center">
      <p className="text-sm text-mh-red">Failed to load magazine feed.</p>
    </div>
  )
}
