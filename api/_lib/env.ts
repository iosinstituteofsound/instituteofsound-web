export function env(...keys: string[]): string {
  for (const key of keys) {
    const v = process.env[key]?.trim()
    if (v) return v
  }
  return ''
}

export function requireEnv(...keys: string[]): string {
  const value = env(...keys)
  if (!value) {
    throw new Error(`Missing server env: ${keys.join(' or ')}`)
  }
  return value
}
