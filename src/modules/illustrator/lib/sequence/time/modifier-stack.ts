import type { BlockModifier } from '@/modules/illustrator/lib/sequence/sequence.types'

export type ModifierRenderHints = {
  mirrorX: boolean
  mirrorY: boolean
  colorTint?: { tint: string; opacity: number }
}

/** Apply time/render modifiers in order after behavior mapping. */
export function applyModifierStack(
  localTimeMs: number,
  durationMs: number,
  modifiers: BlockModifier[],
): { timeMs: number; hints: ModifierRenderHints } {
  let t = localTimeMs
  const hints: ModifierRenderHints = { mirrorX: false, mirrorY: false }

  for (const mod of modifiers) {
    switch (mod.type) {
      case 'speed':
        t *= mod.rate
        break
      case 'reverse':
        t = durationMs - t
        break
      case 'trim':
        t = Math.min(Math.max(t, mod.inMs), mod.outMs)
        break
      case 'freeze':
        t = mod.atTimeMs ?? t
        break
      case 'timeOffset':
        t += mod.offsetMs
        break
      case 'mirror':
        if (mod.axis === 'x') hints.mirrorX = !hints.mirrorX
        else hints.mirrorY = !hints.mirrorY
        break
      case 'color':
        hints.colorTint = { tint: mod.tint, opacity: mod.opacity }
        break
      default:
        break
    }
  }

  return { timeMs: t, hints }
}
