import type { HoldBlock } from '@/modules/illustrator/lib/sequence/sequence.types'
import { applyBehavior, blockLocalTime } from '@/modules/illustrator/lib/sequence/time/behavior'
import { applyModifierStack, type ModifierRenderHints } from '@/modules/illustrator/lib/sequence/time/modifier-stack'

export function computeHoldEvalLocalTime(
  globalTimeMs: number,
  hold: HoldBlock,
): { timeMs: number; hints: ModifierRenderHints } {
  const rawLocal = blockLocalTime(globalTimeMs, hold.startTimeMs)
  const afterBehavior = applyBehavior(rawLocal, hold.durationMs, hold.behavior)
  return applyModifierStack(afterBehavior, hold.durationMs, hold.modifiers)
}
