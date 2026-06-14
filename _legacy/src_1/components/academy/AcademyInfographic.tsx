import type { ReactNode } from 'react'
import type { AcademyInfographicType } from '@/lib/academy/types'

interface AcademyInfographicProps {
  type: AcademyInfographicType
  title: string
}

function Frame({ title, children }: { title: string; children: ReactNode }) {
  return (
    <figure className="academy-info-figure">
      <figcaption className="academy-info-caption">{title}</figcaption>
      <div className="academy-info-canvas">{children}</div>
    </figure>
  )
}

export function AcademyInfographic({ type, title }: AcademyInfographicProps) {
  switch (type) {
    case 'waveform-db':
      return (
        <Frame title={title}>
          <svg viewBox="0 0 400 120" className="academy-info-svg">
            <path d="M20 60 Q60 20 100 60 T180 60 T260 40 T340 70" stroke="var(--color-mh-red)" strokeWidth="2" fill="none" />
            <line x1="20" y1="95" x2="380" y2="95" stroke="var(--color-edge)" />
            <text x="20" y="112" fill="var(--color-muted)" fontSize="9">−∞</text>
            <text x="350" y="112" fill="var(--color-rs-red)" fontSize="9">0 dBFS</text>
            <text x="200" y="30" fill="var(--color-signal)" fontSize="10" textAnchor="middle">
              Peak vs average
            </text>
          </svg>
        </Frame>
      )
    case 'signal-flow':
      return (
        <Frame title={title}>
          <div className="academy-flow">
            {['Input', 'Channel', 'Bus', 'Master', 'Output'].map((n, i) => (
              <div key={n} className="academy-flow-node">
                <span>{n}</span>
                {i < 4 && <span className="academy-flow-arrow">→</span>}
              </div>
            ))}
          </div>
        </Frame>
      )
    case 'arrangement':
      return (
        <Frame title={title}>
          <div className="academy-arrangement">
            {[
              { label: 'Intro', h: 30 },
              { label: 'Verse', h: 45 },
              { label: 'Chorus', h: 85 },
              { label: 'Verse', h: 50 },
              { label: 'Bridge', h: 60 },
              { label: 'Chorus', h: 90 },
            ].map((s) => (
              <div key={s.label + s.h} className="academy-arr-bar">
                <div className="academy-arr-fill" style={{ height: `${s.h}%` }} />
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </Frame>
      )
    case 'static-mix':
      return (
        <Frame title={title}>
          <div className="academy-faders">
            {[
              { l: 'Kick', v: 85 },
              { l: 'Snare', v: 70 },
              { l: 'Bass', v: 75 },
              { l: 'GTR', v: 55 },
              { l: 'Vox', v: 90 },
            ].map((f) => (
              <div key={f.l} className="academy-fader">
                <div className="academy-fader-track">
                  <div className="academy-fader-fill" style={{ height: `${f.v}%` }} />
                </div>
                <span>{f.l}</span>
              </div>
            ))}
          </div>
        </Frame>
      )
    case 'eq-zones':
      return (
        <Frame title={title}>
          <div className="academy-eq-bands">
            {[
              { label: 'Sub', w: 15 },
              { label: 'Low', w: 20 },
              { label: 'Low-mid', w: 25 },
              { label: 'Mid', w: 22 },
              { label: 'High', w: 12 },
              { label: 'Air', w: 8 },
            ].map((b) => (
              <div key={b.label} className="academy-eq-band" style={{ flex: b.w }}>
                <span>{b.label}</span>
              </div>
            ))}
          </div>
        </Frame>
      )
    case 'compressor':
      return (
        <Frame title={title}>
          <svg viewBox="0 0 400 140" className="academy-info-svg">
            <path d="M40 100 L120 100 L200 55 L280 55 L360 55" stroke="var(--color-mh-red)" strokeWidth="2" fill="none" />
            <text x="40" y="120" fill="var(--color-muted)" fontSize="8">Input</text>
            <text x="115" y="120" fill="var(--color-muted)" fontSize="8">Threshold</text>
            <text x="195" y="120" fill="var(--color-muted)" fontSize="8">GR</text>
            <text x="275" y="120" fill="var(--color-muted)" fontSize="8">Output</text>
            <text x="200" y="40" fill="var(--color-signal)" fontSize="10" textAnchor="middle">
              Attack → Release
            </text>
          </svg>
        </Frame>
      )
    case 'master-chain':
      return (
        <Frame title={title}>
          <div className="academy-flow">
            {['Trim', 'EQ', 'Glue', 'Limiter', 'Export'].map((s, i, arr) => (
              <div key={s} className="academy-flow-node">
                <span>{s}</span>
                {i < arr.length - 1 && <span className="academy-flow-arrow">→</span>}
              </div>
            ))}
          </div>
        </Frame>
      )
    case 'loudness':
      return (
        <Frame title={title}>
          <div className="academy-loudness">
            <div className="academy-loud-bar academy-loud-peak" style={{ height: '95%' }}>
              <span>Peak</span>
            </div>
            <div className="academy-loud-bar academy-loud-rms" style={{ height: '62%' }}>
              <span>RMS</span>
            </div>
            <div className="academy-loud-bar academy-loud-crest" style={{ height: '33%' }}>
              <span>Crest</span>
            </div>
          </div>
        </Frame>
      )
    case 'export-qc':
      return (
        <Frame title={title}>
          <ul className="academy-qc-list">
            {['Format', 'Headroom', 'Metadata', 'Artwork', 'Listen'].map((s, i) => (
              <li key={s}>
                <span className="academy-qc-num">{i + 1}</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </Frame>
      )
    case 'mic-placement':
      return (
        <Frame title={title}>
          <div className="academy-mic-map">
            {[
              { label: 'Far', note: 'More room' },
              { label: 'Sweet spot', note: 'Balanced' },
              { label: 'Close', note: 'More bass' },
            ].map((p) => (
              <div key={p.label} className="academy-mic-zone">
                <span className="academy-mic-zone-label">{p.label}</span>
                <span className="academy-mic-zone-note">{p.note}</span>
              </div>
            ))}
          </div>
        </Frame>
      )
    case 'room-treatment':
      return (
        <Frame title={title}>
          <div className="academy-room-grid">
            <span className="academy-room-corner">Bass corners</span>
            <span className="academy-room-reflect">First reflections</span>
            <span className="academy-room-listen">Listening triangle</span>
          </div>
        </Frame>
      )
    case 'double-tracking':
      return (
        <Frame title={title}>
          <div className="academy-double-pan">
            <div className="academy-double-l">L · Double</div>
            <div className="academy-double-c">Center · Lead</div>
            <div className="academy-double-r">R · Double</div>
          </div>
        </Frame>
      )
    case 'genre-spectrum':
      return (
        <Frame title={title}>
          <div className="academy-eq-bands">
            {[
              { label: 'Sub', w: 12 },
              { label: 'Punch', w: 18 },
              { label: 'Grit', w: 28 },
              { label: 'Snarl', w: 25 },
              { label: 'Air', w: 17 },
            ].map((b) => (
              <div key={b.label} className="academy-eq-band" style={{ flex: b.w }}>
                <span>{b.label}</span>
              </div>
            ))}
          </div>
        </Frame>
      )
    case 'metal-template':
      return (
        <Frame title={title}>
          <div className="academy-faders">
            {[
              { l: 'Kick', v: 90 },
              { l: 'Bass', v: 72 },
              { l: 'GTR L', v: 58 },
              { l: 'GTR R', v: 58 },
              { l: 'Vox', v: 88 },
            ].map((f) => (
              <div key={f.l} className="academy-fader">
                <div className="academy-fader-track">
                  <div className="academy-fader-fill" style={{ height: `${f.v}%` }} />
                </div>
                <span>{f.l}</span>
              </div>
            ))}
          </div>
        </Frame>
      )
    case 'cinematic-depth':
      return (
        <Frame title={title}>
          <div className="academy-depth-lanes">
            {[
              { label: 'Front', wet: '10%' },
              { label: 'Mid', wet: '35%' },
              { label: 'Far', wet: '70%' },
            ].map((lane) => (
              <div key={lane.label} className="academy-depth-lane">
                <span>{lane.label}</span>
                <div className="academy-depth-bar">
                  <div className="academy-depth-fill" style={{ width: lane.wet }} />
                </div>
                <span className="academy-depth-wet">Reverb {lane.wet}</span>
              </div>
            ))}
          </div>
        </Frame>
      )
    case 'frequency-bands':
      return (
        <Frame title={title}>
          <div className="academy-eq-bands">
            {[
              { label: 'Low', w: 28 },
              { label: 'Low-mid', w: 22 },
              { label: 'Mid', w: 24 },
              { label: 'High', w: 16 },
              { label: 'Air', w: 10 },
            ].map((b) => (
              <div key={b.label} className="academy-eq-band" style={{ flex: b.w }}>
                <span>{b.label}</span>
              </div>
            ))}
          </div>
        </Frame>
      )
    case 'dynamics-crest':
      return (
        <Frame title={title}>
          <div className="academy-loudness">
            <div className="academy-loud-bar academy-loud-peak" style={{ height: '88%' }}>
              <span>Transient</span>
            </div>
            <div className="academy-loud-bar academy-loud-rms" style={{ height: '55%' }}>
              <span>Body</span>
            </div>
            <div className="academy-loud-bar academy-loud-crest" style={{ height: '38%' }}>
              <span>Crest</span>
            </div>
          </div>
        </Frame>
      )
    case 'reference-ab':
      return (
        <Frame title={title}>
          <div className="academy-flow">
            {['Your mix', 'Match level', 'Reference', 'Note fixes'].map((s, i, arr) => (
              <div key={s} className="academy-flow-node">
                <span>{s}</span>
                {i < arr.length - 1 && <span className="academy-flow-arrow">→</span>}
              </div>
            ))}
          </div>
        </Frame>
      )
    case 'release-timeline':
      return (
        <Frame title={title}>
          <ul className="academy-qc-list">
            {['T−4 mix', 'T−2 master', 'T−1 assets', 'Release'].map((s, i) => (
              <li key={s}>
                <span className="academy-qc-num">{i + 1}</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </Frame>
      )
    case 'metadata-map':
      return (
        <Frame title={title}>
          <div className="academy-meta-grid">
            {['Title', 'Artist', 'ISRC', 'Genre', 'Date', 'Credits'].map((f) => (
              <span key={f} className="academy-meta-field">
                {f}
              </span>
            ))}
          </div>
        </Frame>
      )
    case 'distributor-checklist':
      return (
        <Frame title={title}>
          <ul className="academy-qc-list">
            {['Upload', 'Stores live', 'Art OK', 'Links', 'Promo'].map((s, i) => (
              <li key={s}>
                <span className="academy-qc-num">{i + 1}</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </Frame>
      )
  }
}
