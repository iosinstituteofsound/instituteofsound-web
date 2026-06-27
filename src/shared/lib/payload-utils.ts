export function payloadString(payload: Record<string, unknown>, key: string) {
  const value = payload[key]
  return typeof value === 'string' ? value : undefined
}

export function payloadNumber(payload: Record<string, unknown>, key: string) {
  const value = payload[key]
  return typeof value === 'number' ? value : undefined
}
