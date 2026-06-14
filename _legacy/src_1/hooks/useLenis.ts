import { useEffect } from 'react'
import { useSmoothScroll } from '@/lib/performance'

/**
 * Smooth scroll only on capable desktops. Low-end devices use native scroll.
 */
export function useLenis() {
  const enabled = useSmoothScroll()

  useEffect(() => {
    if (!enabled) return

    let frame = 0
    let lenis: { destroy: () => void; raf: (time: number) => void } | null = null
    let cancelled = false

    void import('lenis').then(({ default: Lenis }) => {
      if (cancelled) return
      lenis = new Lenis({
        duration: 1.1,
        smoothWheel: true,
      })
      const raf = (time: number) => {
        lenis!.raf(time)
        frame = requestAnimationFrame(raf)
      }
      frame = requestAnimationFrame(raf)
    })

    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
      lenis?.destroy()
    }
  }, [enabled])
}
