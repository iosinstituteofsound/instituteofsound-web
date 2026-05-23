import { useCallback, useEffect, useRef, useState } from 'react'
import { getSiteUrl } from '@/lib/auth/siteUrl'
import { resolveAccentColor } from '@/lib/artist-profile/branding'
import { FieldLabel } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { DismissibleBanner } from '@/components/ui/DismissibleBanner'

interface ArtistProfileQrCardProps {
  slug: string
  displayName: string
  accentColor: string
  published?: boolean
}

const QR_SIZE = 280
const POSTER_QR = 720

export function ArtistProfileQrCard({
  slug,
  displayName,
  accentColor,
  published,
}: ArtistProfileQrCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)

  const profileUrl = `${getSiteUrl()}/artist/${slug || 'your-slug'}`
  const accent = resolveAccentColor(accentColor)

  const drawQr = useCallback(
    async (canvas: HTMLCanvasElement, size: number, forPoster: boolean) => {
      const QRCode = await import('qrcode')
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      if (forPoster) {
        const w = 900
        const h = 1100
        canvas.width = w
        canvas.height = h
        ctx.fillStyle = '#050505'
        ctx.fillRect(0, 0, w, h)
        ctx.fillStyle = accent
        ctx.fillRect(0, 0, w, 8)

        ctx.fillStyle = '#f5f5f5'
        ctx.font = 'bold 42px system-ui, sans-serif'
        ctx.textAlign = 'center'
        const name = displayName.toUpperCase().slice(0, 40)
        ctx.fillText(name, w / 2, 90)

        ctx.font = '600 16px system-ui, sans-serif'
        ctx.fillStyle = accent
        ctx.fillText('INSTITUTE OF SOUND', w / 2, 130)

        const qrCanvas = document.createElement('canvas')
        await QRCode.toCanvas(qrCanvas, profileUrl, {
          width: POSTER_QR,
          margin: 2,
          color: { dark: '#f5f5f5', light: '#050505' },
          errorCorrectionLevel: 'H',
        })
        const x = (w - POSTER_QR) / 2
        const y = 200
        ctx.drawImage(qrCanvas, x, y, POSTER_QR, POSTER_QR)

        ctx.strokeStyle = accent
        ctx.lineWidth = 4
        ctx.strokeRect(x - 12, y - 12, POSTER_QR + 24, POSTER_QR + 24)

        ctx.fillStyle = 'rgba(245,245,245,0.65)'
        ctx.font = '18px system-ui, sans-serif'
        ctx.fillText('Scan to listen', w / 2, y + POSTER_QR + 56)
        ctx.font = '14px monospace'
        ctx.fillStyle = 'rgba(245,245,245,0.45)'
        const urlLine = profileUrl.replace(/^https?:\/\//, '')
        ctx.fillText(urlLine, w / 2, y + POSTER_QR + 88)
      } else {
        canvas.width = size
        canvas.height = size
        await QRCode.toCanvas(canvas, profileUrl, {
          width: size,
          margin: 2,
          color: { dark: accent, light: '#0c0c0c' },
          errorCorrectionLevel: 'H',
        })
      }
    },
    [profileUrl, accent, displayName]
  )

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const canvas = canvasRef.current
      if (!canvas || !slug) {
        setReady(false)
        return
      }
      setError('')
      try {
        await drawQr(canvas, QR_SIZE, false)
        if (!cancelled) setReady(true)
      } catch {
        if (!cancelled) {
          setError('Could not generate QR code')
          setReady(false)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [slug, profileUrl, accent, drawQr])

  const download = async (poster: boolean) => {
    const canvas = document.createElement('canvas')
    try {
      await drawQr(canvas, poster ? POSTER_QR : QR_SIZE, poster)
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), 'image/png')
      )
      if (!blob) throw new Error('Export failed')
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = poster
        ? `ios-${slug}-poster-qr.png`
        : `ios-${slug}-qr.png`
      a.click()
      URL.revokeObjectURL(a.href)
    } catch {
      setError('Download failed — please try again')
    }
  }

  return (
    <section className="ios-panel space-y-5">
      <div>
        <p className="ios-kicker">QR for posters & merch</p>
        <p className="text-sm text-muted mt-2 leading-relaxed">
          Scan opens your public profile. Print on stickers, posters, merch, and show flyers.
        </p>
        {!published && (
          <p className="text-xs text-mh-red mt-2">
            Profile is still a draft — the QR works once you are live on Discover.
          </p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-6 items-start">
        <div className="artist-qr-preview-wrap">
          <canvas ref={canvasRef} className="artist-qr-canvas" aria-label="Profile QR code" />
        </div>
        <div className="flex-1 space-y-4 min-w-0">
          <div>
            <FieldLabel>Profile link</FieldLabel>
            <p className="text-xs font-mono text-muted break-all mt-1">{profileUrl}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="primary"
              disabled={!ready || !slug}
              onClick={() => download(false)}
            >
              Download QR (PNG)
            </Button>
            <Button
              type="button"
              variant="metal"
              disabled={!ready || !slug}
              onClick={() => download(true)}
            >
              Poster pack (PNG)
            </Button>
          </div>
          <p className="text-xs text-muted leading-relaxed">
            <strong className="text-foreground">QR PNG</strong> — square, social / small print.{' '}
            <strong className="text-foreground">Poster pack</strong> — naam + branding + scan line,
            Optimized for A4 print.
          </p>
          {error && (
            <DismissibleBanner variant="error" onDismiss={() => setError('')}>
              {error}
            </DismissibleBanner>
          )}
        </div>
      </div>
    </section>
  )
}
