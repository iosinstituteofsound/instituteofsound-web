import type { AssetRef, Sequence } from '@/modules/illustrator/lib/sequence/sequence.types'

export type SequenceManifestEntry = {
  path: string
  kind: 'embedded' | 'linked'
  sha256?: string
  byteSize?: number
}

export type SequenceManifest = {
  version: 1
  rootSequenceId: string
  sequences: Record<string, Sequence>
  assetRefs: AssetRef[]
  files: SequenceManifestEntry[]
  createdAt: string
  updatedAt: string
}

export function createEmptyManifest(rootSequenceId: string): SequenceManifest {
  const now = new Date().toISOString()
  return {
    version: 1,
    rootSequenceId,
    sequences: {},
    assetRefs: [],
    files: [],
    createdAt: now,
    updatedAt: now,
  }
}
