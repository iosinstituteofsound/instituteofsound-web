/** Feature flag — isolated from React context so Vite HMR does not invalidate the provider. */
export function isSequenceEngineEnabled(): boolean {
  return import.meta.env.VITE_SEQUENCE_ENGINE === 'true'
}
