type CryptoUuid = ReturnType<Crypto['randomUUID']>

function createUuidV4(): CryptoUuid {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0
    const value = char === 'x' ? random : (random & 0x3) | 0x8
    return value.toString(16)
  }) as CryptoUuid
}

/** Works on HTTP LAN dev (mobile testing) where `crypto.randomUUID` is unavailable. */
export function randomUUID(): CryptoUuid {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return createUuidV4()
}

/** Patch `crypto.randomUUID` before app code runs (import from main.tsx first). */
export function ensureCryptoRandomUUID(): void {
  if (typeof globalThis.crypto === 'undefined') return
  if (typeof globalThis.crypto.randomUUID === 'function') return

  globalThis.crypto.randomUUID = () => createUuidV4()
}
