import { X } from 'lucide-react'
import {
  buildDefaultSoundDnaRows,
  editorSoundDnaRows,
  SOUND_DNA_LABELS,
  soundDnaRowsToMeta,
} from '@/modules/editor/lib/sound-dna-utils'
import type { ArticleEditorMeta } from '@/modules/editor/types/article-editor.types'
import { Input } from '@/shared/components/ui/input'

interface ArticleSoundDnaToolPanelProps {
  meta: ArticleEditorMeta
  slug: string
  onMetaChange: (patch: Partial<ArticleEditorMeta>) => void
  onDeselect: () => void
}

export function ArticleSoundDnaToolPanel({
  meta,
  slug,
  onMetaChange,
  onDeselect,
}: ArticleSoundDnaToolPanelProps) {
  const fallback = buildDefaultSoundDnaRows({ slug, type: meta.type })
  const rows = editorSoundDnaRows(meta, fallback)

  const updateValue = (label: string, value: string) => {
    const next = rows.map((row) => (row.label === label ? { ...row, value } : row))
    onMetaChange({ soundDna: soundDnaRowsToMeta(next) })
  }

  return (
    <div className="article-sound-dna-tool article-edit-tool-panel">
      <div className="article-edit-tool-panel__header">
        <span className="article-edit-tool-panel__title">Sound DNA</span>
        <button
          type="button"
          className="article-edit-tool-panel__close"
          title="Close"
          onClick={onDeselect}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="article-edit-tool-panel__body">
        <p className="article-sound-dna-tool__hint">
          Leave a value blank to hide that row in the article.
        </p>

        <div className="article-sound-dna-tool__fields">
          {SOUND_DNA_LABELS.map((label) => {
            const row = rows.find((entry) => entry.label === label)
            return (
              <div key={label} className="article-sound-dna-tool__field">
                <label className="article-sound-dna-tool__label" htmlFor={`sound-dna-${label}`}>
                  {label}
                </label>
                <Input
                  id={`sound-dna-${label}`}
                  value={row?.value ?? ''}
                  onChange={(event) => updateValue(label, event.target.value)}
                  onKeyDown={(event) => event.stopPropagation()}
                  placeholder={`${label}…`}
                  className="article-sound-dna-tool__input"
                />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
