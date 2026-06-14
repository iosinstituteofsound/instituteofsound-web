import type { ReactNode } from 'react'

/** Shared micro-UI for member desk tabs (ios_ui dashboard-studio.css) */

export function DeskGlyph({ children }: { children: ReactNode }) {
  return (
    <span className="inline-grid place-items-center" aria-hidden>
      {children}
    </span>
  )
}

export function MfaWaveBars({ heights = [5, 8, 6, 10, 7, 9, 4, 11, 6, 8] }: { heights?: number[] }) {
  return (
    <div className="mfa-wave-bars" aria-hidden>
      {heights.map((h, i) => (
        <span key={i} className="mfa-wave-bar" data-h={String(h)} />
      ))}
    </div>
  )
}

export function MwsProgressRing({ pct = 68 }: { pct?: number }) {
  const r = 28
  const c = 2 * Math.PI * r
  const dash = (pct / 100) * c
  return (
    <svg className="mws-ring" viewBox="0 0 64 64" aria-hidden>
      <circle className="mws-ring-track" cx="32" cy="32" r={r} />
      <circle
        className="mws-ring-fill"
        cx="32"
        cy="32"
        r={r}
        strokeDasharray={`${dash} ${c}`}
      />
      <text className="mws-ring-text" x="32" y="36" textAnchor="middle">
        {pct}%
      </text>
    </svg>
  )
}
