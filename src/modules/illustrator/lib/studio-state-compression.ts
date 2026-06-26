function uint8ToBase64(bytes: Uint8Array): string {
  const chunk = 0x8000
  let binary = ''
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return btoa(binary)
}

export async function compressStudioStateJson(json: string): Promise<string> {
  if (typeof CompressionStream === 'undefined') {
    throw new Error('Studio autosave requires CompressionStream support in this browser.')
  }

  const stream = new Blob([json]).stream().pipeThrough(new CompressionStream('gzip'))
  const buffer = await new Response(stream).arrayBuffer()
  return uint8ToBase64(new Uint8Array(buffer))
}
