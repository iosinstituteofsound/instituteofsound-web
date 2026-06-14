/** Stable 8-digit display ID from profile UUID (for nav, support, receipts). */
export function formatAccountNumericId(userId: string): string {
  const clean = userId.replace(/-/g, '')
  let hash = 0
  for (let i = 0; i < clean.length; i++) {
    hash = Math.imul(31, hash) + parseInt(clean[i], 16)
    hash >>>= 0
  }
  return String(hash % 100_000_000).padStart(8, '0')
}
