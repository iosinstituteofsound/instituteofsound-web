import { Link } from 'react-router-dom'
import type { Signal } from '@/types'
import { MetalBadge } from '@/components/ui/MetalBadge'
import { MagazineSectionHeading } from '@/components/ui/MagazineSectionHeading'

type Props = {
  signals: Signal[]
}

const ACTIVITY = [
  { user: 'Mira K.', action: 'reviewed Drown In Static', time: '2m ago' },
  { user: 'Zeke', action: 'submitted a new track', time: '14m ago' },
  { user: 'Nova', action: 'joined Tribe: Industrial', time: '1h ago' },
]

const EVENTS = [
  { month: 'MAY', day: '18', title: 'Underground Fest 2026', place: 'antiSOCIAL, Mumbai', tag: 'Music' },
  { month: 'MAY', day: '24', title: 'Noise Ritual Night', place: 'Junkyard, Delhi', tag: 'Music' },
  { month: 'JUN', day: '07', title: 'IOS Community Meet', place: 'Online', tag: 'Community' },
]

export function RightRail({ signals }: Props) {
  return (
    <aside className="hidden w-[300px] shrink-0 flex-col gap-5 overflow-y-auto border-l border-border bg-surface/50 p-4 backdrop-blur-sm xl:flex">
      <Widget>
        <MagazineSectionHeading kicker="Live" title="What's Happening" />
        <div className="mb-4 flex gap-4 border-b border-border pb-2 text-[10px] font-bold uppercase tracking-[0.15em]">
          <span className="text-mh-red">Activity</span>
          <span className="text-muted">Signals</span>
          <span className="text-muted">Following</span>
        </div>
        <ul className="space-y-4">
          {ACTIVITY.map((item) => (
            <li key={item.time} className="flex gap-3">
              <div className="mt-0.5 h-8 w-8 shrink-0 border border-border bg-elevated" />
              <div>
                <p className="text-[12px] leading-snug">
                  <span className="font-semibold text-signal">{item.user}</span>{' '}
                  <span className="text-muted">{item.action}</span>
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-wider text-muted">{item.time}</p>
              </div>
            </li>
          ))}
        </ul>
      </Widget>

      {signals.length > 0 && (
        <Widget>
          <p className="ios-kicker mb-4">Wire</p>
          <ul className="space-y-3">
            {signals.slice(0, 3).map((s) => (
              <li key={s.id}>
                <Link to="/signals" className="group block">
                  <MetalBadge variant="crimson">{s.category}</MetalBadge>
                  <p className="mt-2 font-display text-xs font-bold uppercase leading-snug tracking-wide text-signal transition-colors group-hover:text-rs-red line-clamp-2">
                    {s.title}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </Widget>
      )}

      <Widget>
        <p className="ios-kicker mb-4">Calendar</p>
        <ul className="space-y-4">
          {EVENTS.map((ev) => (
            <li key={ev.title} className="flex gap-3">
              <div
                className="flex h-14 w-14 shrink-0 flex-col items-center justify-center border border-border bg-void"
                style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)' }}
              >
                <span className="text-[8px] font-bold tracking-widest text-mh-red">{ev.month}</span>
                <span className="font-display text-xl font-extrabold leading-none text-signal">
                  {ev.day}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-signal">{ev.title}</p>
                <p className="mt-0.5 text-[10px] text-muted">{ev.place}</p>
                <MetalBadge className="mt-2 !text-[8px]">{ev.tag}</MetalBadge>
              </div>
            </li>
          ))}
        </ul>
        <Link
          to="/events"
          className="mt-4 inline-block font-display text-[10px] font-bold uppercase tracking-[0.2em] text-mh-red hover:text-rs-red"
        >
          View calendar →
        </Link>
      </Widget>

      <div className="ios-card overflow-hidden">
        <div
          className="flex h-32 items-end bg-cover bg-center p-4"
          style={{
            backgroundImage:
              'linear-gradient(to top, #0c0c0c 15%, transparent 60%), url(https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80)',
          }}
        >
          <p className="font-display text-[11px] font-bold uppercase tracking-[0.12em] text-signal">
            Support the Culture
          </p>
        </div>
        <div className="p-4">
          <p className="text-xs leading-relaxed text-muted">
            Back underground artists and editorial independence.
          </p>
          <Link to="/register" className="ios-btn ios-btn-secondary mt-4 w-full !text-[10px]">
            Become a Supporter
          </Link>
        </div>
      </div>
    </aside>
  )
}

function Widget({ children }: { children: React.ReactNode }) {
  return <section className="ios-panel p-4 pl-5">{children}</section>
}
