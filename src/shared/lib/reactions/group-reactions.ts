export function groupReactionsByEmoji<T extends { emoji: string }>(reactions: T[]) {
  const groups = new Map<string, number>()
  for (const reaction of reactions) {
    groups.set(reaction.emoji, (groups.get(reaction.emoji) ?? 0) + 1)
  }
  return [...groups.entries()]
}
