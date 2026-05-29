import { useState } from 'react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import type { Signal } from '@/types'
import { MetalBadge } from '@/components/ui/MetalBadge'

type Props = {
  signals: Signal[]
}

type RailTab = 'activity' | 'signals' | 'following'

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
  const [tab, setTab] = useState<RailTab>('activity')

  return (
    <aside className="v2-rail">
      <div className="v2-rail-inner">
        <Widget>
          <header className="v2-rail-block-head">
            <p className="ios-kicker">Live</p>
            <h2 className="v2-rail-title">What&apos;s Happening</h2>
          </header>

          <div className="v2-rail-tabs" role="tablist" aria-label="Activity filters">
            {(
              [
                ['activity', 'Activity'],
                ['signals', 'Signals'],
                ['following', 'Following'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={tab === id ? 'true' : 'false'}
                className={clsx('v2-rail-tab', tab === id && 'v2-rail-tab--active')}
                onClick={() => setTab(id)}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === 'activity' && (
            <ul className="v2-rail-activity">
              {ACTIVITY.map((item) => (
                <li key={item.time} className="v2-rail-activity-item">
                  <div className="v2-rail-activity-avatar" aria-hidden>
                    {item.user.charAt(0)}
                  </div>
                  <div className="v2-rail-activity-copy">
                    <p className="v2-rail-activity-text">
                      <span className="v2-rail-activity-user">{item.user}</span>{' '}
                      <span className="v2-rail-activity-action">{item.action}</span>
                    </p>
                    <p className="v2-rail-activity-time">{item.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {tab === 'signals' && (
            <ul className="v2-rail-signal-feed">
              {(signals.length > 0 ? signals.slice(0, 4) : []).map((s) => (
                <li key={s.id}>
                  <Link to="/signals" className="v2-rail-signal-feed-link">
                    <MetalBadge variant="crimson">{s.category}</MetalBadge>
                    <p className="v2-rail-signal-feed-title">{s.title}</p>
                  </Link>
                </li>
              ))}
              {signals.length === 0 && (
                <li>
                  <p className="v2-rail-empty">No signals on the wire yet.</p>
                </li>
              )}
            </ul>
          )}

          {tab === 'following' && (
            <div className="v2-rail-empty-block">
              <p className="v2-rail-empty-title">Your feed is quiet</p>
              <p className="v2-rail-empty">
                Follow artists and editors to see their moves here.
              </p>
              <Link to="/network" className="v2-rail-empty-cta">
                Explore network →
              </Link>
            </div>
          )}
        </Widget>

        {signals.length > 0 && (
          <Widget>
            <header className="v2-rail-block-head v2-rail-block-head--compact">
              <p className="ios-kicker">Wire</p>
            </header>
            <ul className="v2-rail-wire">
              {signals.slice(0, 3).map((s, i) => (
                <li key={s.id} className={clsx(i > 0 && 'v2-rail-wire-item--border')}>
                  <Link to="/signals" className="v2-rail-wire-link">
                    <MetalBadge variant="crimson">{s.category}</MetalBadge>
                    <p className="v2-rail-wire-title">{s.title}</p>
                    <span className="v2-rail-wire-arrow" aria-hidden>
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Widget>
        )}

        <Widget>
          <header className="v2-rail-block-head v2-rail-block-head--compact">
            <p className="ios-kicker">Calendar</p>
          </header>
          <ul className="v2-rail-calendar">
            {EVENTS.map((ev) => (
              <li key={ev.title} className="v2-rail-calendar-item">
                <div className="v2-rail-calendar-date">
                  <span className="v2-rail-calendar-month">{ev.month}</span>
                  <span className="v2-rail-calendar-day">{ev.day}</span>
                </div>
                <div className="v2-rail-calendar-copy">
                  <p className="v2-rail-calendar-title">{ev.title}</p>
                  <p className="v2-rail-calendar-place">{ev.place}</p>
                  <MetalBadge className="v2-rail-calendar-tag">{ev.tag}</MetalBadge>
                </div>
              </li>
            ))}
          </ul>
          <Link to="/events" className="v2-rail-calendar-more">
            View calendar →
          </Link>
        </Widget>

        <div className="v2-rail-promo">
          <div className="v2-rail-promo-visual">
            <p className="v2-rail-promo-kicker">Support</p>
            <p className="v2-rail-promo-title">Back the Culture</p>
          </div>
          <div className="v2-rail-promo-body">
            <p className="v2-rail-promo-copy">
              Back underground artists and editorial independence.
            </p>
            <Link to="/register" className="ios-btn ios-btn-secondary v2-rail-promo-btn">
              Become a Supporter
            </Link>
          </div>
        </div>
      </div>
    </aside>
  )
}

function Widget({ children }: { children: React.ReactNode }) {
  return <section className="v2-rail-widget">{children}</section>
}
