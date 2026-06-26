/** Time budget per animation frame for paint work — samples never dropped, only spread across frames. */
export const PAINT_FRAME_BUDGET_MS = 12

export function consumeWithinBudget<T>(
  items: T[],
  budgetMs: number,
  process: (item: T, index: number) => void,
): T[] {
  if (!items.length) return []
  const start = performance.now()
  let index = 0
  while (index < items.length) {
    process(items[index], index)
    index += 1
    if (index < items.length && performance.now() - start >= budgetMs) {
      return items.slice(index)
    }
  }
  return []
}
