import { useEffect, useRef, useState } from 'react'
import { fetchLinkPreview } from '@/modules/feed/api/link-preview.api'
import { extractFirstUrl, type LinkPreview } from '@/modules/feed/lib/link-preview'

export function useLinkPreview(text: string, enabled = true) {
  const [preview, setPreview] = useState<LinkPreview | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const requestId = useRef(0)

  const detectedUrl = enabled ? extractFirstUrl(text) : null

  useEffect(() => {
    if (!enabled || !detectedUrl) {
      setPreview(null)
      setIsLoading(false)
      return
    }

    const currentRequest = ++requestId.current
    setPreview(null)
    setIsLoading(true)

    const timer = window.setTimeout(() => {
      void fetchLinkPreview(detectedUrl)
        .then((next) => {
          if (requestId.current !== currentRequest) return
          setPreview(next)
        })
        .finally(() => {
          if (requestId.current === currentRequest) setIsLoading(false)
        })
    }, 400)

    return () => window.clearTimeout(timer)
  }, [enabled, detectedUrl])

  return { detectedUrl, preview, isLoading }
}
