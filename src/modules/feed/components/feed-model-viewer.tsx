import { createElement, useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import '@google/model-viewer'

interface FeedModelViewerProps {
  src: string
  iosSrc?: string
  poster?: string
  alt?: string
  className?: string
  autoRotate?: boolean
  cameraControls?: boolean
}

export function FeedModelViewer({
  src,
  iosSrc,
  poster,
  alt = '3D model',
  className,
  autoRotate = true,
  cameraControls = true,
}: FeedModelViewerProps) {
  const ref = useRef<HTMLElement>(null)
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    setLoading(true)
    setFailed(false)

    const onLoad = () => {
      setLoading(false)
      setFailed(false)
    }
    const onError = () => {
      setLoading(false)
      setFailed(true)
    }

    el.addEventListener('load', onLoad)
    el.addEventListener('error', onError)

    return () => {
      el.removeEventListener('load', onLoad)
      el.removeEventListener('error', onError)
    }
  }, [src])

  if (!src) return null

  return (
    <div className="feed-model-viewer-wrap">
      {loading && !failed ? (
        <div className="feed-model-viewer-wrap__status" aria-hidden>
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : null}

      {failed ? (
        <div className="feed-model-viewer-wrap__status feed-model-viewer-wrap__status--error">
          <p className="text-sm font-medium">3D preview could not load</p>
          <a href={src} target="_blank" rel="noreferrer" className="text-xs text-primary underline">
            Download model file
          </a>
        </div>
      ) : null}

      {createElement('model-viewer', {
        ref,
        key: src,
        src,
        ...(iosSrc ? { 'ios-src': iosSrc } : {}),
        ...(poster ? { poster } : {}),
        class: className,
        alt,
        crossorigin: 'anonymous',
        'shadow-intensity': '1',
        exposure: '1.2',
        'camera-controls': cameraControls ? '' : undefined,
        'auto-rotate': autoRotate ? '' : undefined,
        'interaction-prompt': 'auto',
        'touch-action': 'pan-y',
        loading: 'eager',
        reveal: 'auto',
        bounds: 'tight',
        style: {
          width: '100%',
          height: '100%',
          minHeight: '320px',
          background: 'linear-gradient(180deg, #2a2a35 0%, #14141c 100%)',
        },
      })}
    </div>
  )
}
