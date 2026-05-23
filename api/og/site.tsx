import { ImageResponse } from '@vercel/og'

export const config = {
  runtime: 'nodejs',
  maxDuration: 15,
}

const ACCENT = '#d40000'
const VOID = '#050505'
const SIGNAL = '#f5f5f5'

/** Homepage / default link preview — gothic editorial, motion-style waveform */
export default async function handler() {
  const barHeights = [48, 132, 76, 220, 58, 168, 94, 198, 62, 152, 88, 184, 72, 140, 104, 210]

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          background: VOID,
          overflow: 'hidden',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Ambient red glow */}
        <div
          style={{
            position: 'absolute',
            width: 900,
            height: 900,
            left: -200,
            top: -280,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${ACCENT}44 0%, transparent 62%)`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 700,
            height: 700,
            right: -120,
            bottom: -200,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,21,56,0.35) 0%, transparent 65%)',
          }}
        />

        {/* Scanlines */}
        {Array.from({ length: 32 }).map((_, i) => (
          <div
            key={`scan-${i}`}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: i * 20,
              height: 1,
              background: 'rgba(255,255,255,0.03)',
            }}
          />
        ))}

        {/* Diagonal hazard stripes */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.06,
            background:
              'repeating-linear-gradient(-12deg, transparent, transparent 14px, rgba(212,0,0,0.9) 14px, rgba(212,0,0,0.9) 16px)',
          }}
        />

        {/* Pulse rings (static “animation” frame) */}
        <div
          style={{
            position: 'absolute',
            right: 80,
            top: 120,
            width: 280,
            height: 280,
            borderRadius: '50%',
            border: `2px solid ${ACCENT}33`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: 200,
              height: 200,
              borderRadius: '50%',
              border: `1px solid ${ACCENT}55`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                border: `2px solid ${ACCENT}`,
                boxShadow: `0 0 48px ${ACCENT}88`,
              }}
            />
          </div>
        </div>

        {/* Waveform / equalizer */}
        <div
          style={{
            position: 'absolute',
            right: 48,
            bottom: 0,
            display: 'flex',
            alignItems: 'flex-end',
            gap: 6,
            height: 280,
            paddingBottom: 48,
          }}
        >
          {barHeights.map((h, i) => (
            <div
              key={`bar-${i}`}
              style={{
                width: 10,
                height: h,
                background:
                  i % 3 === 0
                    ? `linear-gradient(180deg, ${ACCENT} 0%, ${ACCENT}99 40%, #3a0000 100%)`
                    : `linear-gradient(180deg, rgba(245,245,245,0.85) 0%, rgba(212,0,0,0.5) 100%)`,
                boxShadow: i % 4 === 0 ? `0 0 20px ${ACCENT}aa` : 'none',
                opacity: 0.55 + (i % 5) * 0.08,
              }}
            />
          ))}
        </div>

        {/* Top accent */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 8,
            background: `linear-gradient(90deg, ${ACCENT}, #8b1538, ${ACCENT})`,
          }}
        />

        {/* Main copy */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '64px 72px',
            position: 'relative',
            maxWidth: 780,
          }}
        >
          <div
            style={{
              fontSize: 20,
              letterSpacing: '0.42em',
              textTransform: 'uppercase',
              color: ACCENT,
              marginBottom: 28,
              fontWeight: 700,
            }}
          >
            Transmission · Underground
          </div>

          {/* Glitch stack */}
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                position: 'absolute',
                left: 4,
                top: 4,
                fontSize: 88,
                fontWeight: 900,
                letterSpacing: '-0.02em',
                textTransform: 'uppercase',
                color: `${ACCENT}55`,
                lineHeight: 0.9,
              }}
            >
              Institute
            </div>
            <div
              style={{
                position: 'absolute',
                left: -3,
                top: -2,
                fontSize: 88,
                fontWeight: 900,
                letterSpacing: '-0.02em',
                textTransform: 'uppercase',
                color: 'rgba(0,200,255,0.12)',
                lineHeight: 0.9,
              }}
            >
              Institute
            </div>
            <div
              style={{
                fontSize: 88,
                fontWeight: 900,
                letterSpacing: '-0.02em',
                textTransform: 'uppercase',
                color: SIGNAL,
                lineHeight: 0.9,
                textShadow: '0 0 40px rgba(212,0,0,0.35)',
              }}
            >
              Institute
            </div>
          </div>

          <div
            style={{
              fontSize: 52,
              fontWeight: 800,
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: 'rgba(245,245,245,0.92)',
              marginTop: 8,
              marginLeft: 4,
            }}
          >
            of Sound
          </div>

          <div
            style={{
              fontSize: 26,
              color: 'rgba(245,245,245,0.72)',
              marginTop: 36,
              lineHeight: 1.45,
              maxWidth: 620,
            }}
          >
            Reviews · Features · Bands · Editorial desk
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              marginTop: 44,
            }}
          >
            <div
              style={{
                width: 48,
                height: 3,
                background: ACCENT,
                boxShadow: `0 0 12px ${ACCENT}`,
              }}
            />
            <div
              style={{
                fontSize: 18,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'rgba(245,245,245,0.45)',
              }}
            >
              instituteofsound.in
            </div>
          </div>
        </div>

        {/* Corner frame */}
        <div
          style={{
            position: 'absolute',
            left: 40,
            bottom: 40,
            width: 120,
            height: 120,
            borderLeft: `2px solid ${ACCENT}66`,
            borderBottom: `2px solid ${ACCENT}66`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: 40,
            top: 48,
            width: 80,
            height: 80,
            borderRight: '2px solid rgba(245,245,245,0.15)',
            borderTop: '2px solid rgba(245,245,245,0.15)',
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
