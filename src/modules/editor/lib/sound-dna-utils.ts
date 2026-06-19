import { articleSoundDna, type SoundDnaRow } from '@/modules/explore/lib/article-content'
import type { ArticleDto } from '@/modules/explore/types/explore.types'
import type { ArticleEditorMeta, ArticleSoundDnaField } from '@/modules/editor/types/article-editor.types'

export const SOUND_DNA_LABELS = ['Genre', 'BPM', 'Mood', 'Key', 'Session', 'Format'] as const

export type SoundDnaLabel = (typeof SOUND_DNA_LABELS)[number]

export function visibleSoundDnaRows(rows: SoundDnaRow[]): SoundDnaRow[] {
  return rows.filter((row) => row.value.trim().length > 0)
}

export function parseSoundDnaFields(raw: unknown): ArticleSoundDnaField[] | undefined {
  if (!Array.isArray(raw)) return undefined

  const parsed = raw
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const row = item as Record<string, unknown>
      const label = typeof row.label === 'string' ? row.label.trim() : ''
      const value = typeof row.value === 'string' ? row.value : ''
      if (!label) return null
      return { label, value }
    })
    .filter((row): row is ArticleSoundDnaField => row !== null)

  return parsed.length ? parsed : undefined
}

export function buildDefaultSoundDnaRows(article: Pick<ArticleDto, 'slug' | 'type'>): SoundDnaRow[] {
  return articleSoundDna(article as ArticleDto)
}

export function editorSoundDnaRows(
  meta: Pick<ArticleEditorMeta, 'soundDna'>,
  fallback: SoundDnaRow[],
): SoundDnaRow[] {
  const fallbackByLabel = new Map(fallback.map((row) => [row.label, row.value]))
  const metaByLabel = new Map((meta.soundDna ?? []).map((row) => [row.label, row.value]))

  return SOUND_DNA_LABELS.map((label) => ({
    label,
    value: metaByLabel.get(label) ?? fallbackByLabel.get(label) ?? '',
  }))
}

export function soundDnaRowsToMeta(rows: SoundDnaRow[]): ArticleSoundDnaField[] {
  return rows.map((row) => ({
    label: row.label,
    value: row.value.trim(),
  }))
}

export function resolveVisibleSoundDna(
  meta: Pick<ArticleEditorMeta, 'soundDna'>,
  fallback: SoundDnaRow[],
): SoundDnaRow[] {
  return visibleSoundDnaRows(editorSoundDnaRows(meta, fallback))
}

export function readSoundDnaFromPuckMeta(
  puckData: Record<string, unknown> | undefined,
): ArticleSoundDnaField[] | undefined {
  if (!puckData || typeof puckData !== 'object') return undefined
  const meta = puckData.meta
  if (!meta || typeof meta !== 'object') return undefined
  return parseSoundDnaFields((meta as Record<string, unknown>).soundDna)
}
