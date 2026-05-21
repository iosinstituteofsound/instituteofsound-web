/** Detect low-end devices — avoid infinite JS animation loops */
export type PerformanceProfile = 'full' | 'lite'

let cached: PerformanceProfile | null = null

export function getPerformanceProfile(): PerformanceProfile {
  if (cached) return cached
  if (typeof window === 'undefined') return 'lite'

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    cached = 'lite'
    return cached
  }

  const nav = navigator as Navigator & { deviceMemory?: number }
  const memory = nav.deviceMemory
  const cores = navigator.hardwareConcurrency ?? 4

  if ((memory !== undefined && memory <= 4) || cores <= 4) {
    cached = 'lite'
    return cached
  }

  if (window.matchMedia('(pointer: coarse)').matches) {
    cached = 'lite'
    return cached
  }

  cached = 'full'
  return cached
}

export function applyPerformanceProfile(): void {
  document.documentElement.dataset.perf = getPerformanceProfile()
}

export function useSmoothScroll(): boolean {
  return getPerformanceProfile() === 'full'
}
