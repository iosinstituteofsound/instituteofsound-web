export function createPuckBlockId(): string {
  return `puck-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

/** Puck 0.13+ requires an `id` on every block's props. Reuse canvas `blockId` when present. */
export function withPuckId<T extends Record<string, unknown>>(
  props: T,
): T & { id: string } {
  const existing = props.id
  if (typeof existing === 'string' && existing.length > 0) {
    return props as T & { id: string }
  }

  const id =
    typeof props.blockId === 'string' && props.blockId.length > 0
      ? props.blockId
      : createPuckBlockId()

  return { ...props, id }
}
