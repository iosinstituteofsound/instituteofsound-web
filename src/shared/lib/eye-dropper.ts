export function isEyeDropperSupported(): boolean {
  return typeof window !== 'undefined' && 'EyeDropper' in window
}

export async function pickColorFromScreen(): Promise<string | null> {
  if (!isEyeDropperSupported()) return null

  try {
    const dropper = new window.EyeDropper!()
    const result = await dropper.open()
    return result.sRGBHex
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') return null
    throw error
  }
}
