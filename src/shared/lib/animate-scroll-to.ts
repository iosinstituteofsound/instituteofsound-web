function easeOutCubic(progress: number) {
  return 1 - (1 - progress) ** 3
}

export function animateScrollToTop(
  container: HTMLElement | Window | null | undefined,
  duration = 420,
) {
  const isWindow = !container || container === window
  const element = isWindow ? null : (container as HTMLElement)
  const start = isWindow ? window.scrollY : element!.scrollTop

  if (start <= 0) return

  const startTime = performance.now()

  const step = (now: number) => {
    const elapsed = now - startTime
    const progress = Math.min(elapsed / duration, 1)
    const nextTop = start * (1 - easeOutCubic(progress))

    if (isWindow) {
      window.scrollTo(0, nextTop)
    } else {
      element!.scrollTop = nextTop
    }

    if (progress < 1) {
      requestAnimationFrame(step)
    }
  }

  requestAnimationFrame(step)
}
