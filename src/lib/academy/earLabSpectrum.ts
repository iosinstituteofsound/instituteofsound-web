/** Log-spaced bands for the EQ frequency identification game (Ear Lab). */
export const EAR_SPECTRUM_HZ = [
  71, 100, 141, 200, 283, 400, 566, 800, 1131, 1600, 2263, 3200, 4525, 6400, 9051, 12800,
  18102,
] as const

export const EAR_FREQ_GAME_STAGES = 5
export const EAR_FREQ_GAME_LIVES = 3

export function pickRandomSpectrumHz(): number {
  const idx = Math.floor(Math.random() * EAR_SPECTRUM_HZ.length)
  return EAR_SPECTRUM_HZ[idx]!
}

export function nearestSpectrumHz(hz: number): number {
  let best: number = EAR_SPECTRUM_HZ[0]
  let diff = Math.abs(hz - best)
  for (const h of EAR_SPECTRUM_HZ) {
    const d = Math.abs(hz - h)
    if (d < diff) {
      diff = d
      best = h
    }
  }
  return best
}

export function spectrumIndexForHz(hz: number): number {
  const nearest = nearestSpectrumHz(hz)
  return EAR_SPECTRUM_HZ.findIndex((h) => h === nearest)
}

/** Map correct count (0–5) to stored progress scale (0–10). */
export function frequencyGameScoreToProgress(correct: number, stages = EAR_FREQ_GAME_STAGES): number {
  return Math.min(10, Math.round((correct / stages) * 10))
}
