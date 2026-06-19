import { MoreHorizontal, PenLine, Plus, Trash2, Upload } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { ArticleDto, ArticleType } from '@/modules/explore/types/explore.types'
import { resolveDraftPreview } from '@/modules/editor/lib/draft-preview'
import { Button } from '@/shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { cn } from '@/shared/lib/cn'
import '@/modules/editor/styles/editor-desk.css'

const ARTICLE_TYPE_LABELS: Record<ArticleType, string> = {
  review: 'Album review',
  single: 'Single',
  ep: 'EP',
  feature: 'Feature',
  band_profile: 'Band profile',
}

function draftMeta(draft: ArticleDto) {
  if (draft.updatedAt) {
    const edited = new Date(draft.updatedAt)
    const label = edited.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    return `Draft · ${label}`
  }
  if (draft.type) return ARTICLE_TYPE_LABELS[draft.type] ?? draft.type
  if (draft.excerpt?.trim()) return draft.excerpt.trim()
  return 'Incomplete draft'
}

function DraftPreviewSurface({ draft }: { draft: ArticleDto }) {
  const preview = resolveDraftPreview(draft)

  if (preview.imageUrl) {
    return <img src={preview.imageUrl} alt="" loading="lazy" className="editor-desk-card__img" />
  }

  if (preview.backgroundColor || preview.previewText) {
    return (
      <div
        className="editor-desk-card__preview-surface"
        style={{ backgroundColor: preview.backgroundColor ?? 'var(--card)' }}
      >
        <p className="editor-desk-card__preview-text">
          {preview.previewText?.trim() || 'Untitled draft'}
        </p>
      </div>
    )
  }

  return (
    <div className="editor-desk-card__fallback" aria-hidden>
      <PenLine className="editor-desk-card__fallback-icon" strokeWidth={1.5} />
    </div>
  )
}

interface EditorDeskGridProps {
  drafts: ArticleDto[]
  onPublish: (id: string) => void
  onDelete: (id: string) => void
  isPublishing?: boolean
  isDeleting?: boolean
}

export function EditorDeskGrid({
  drafts,
  onPublish,
  onDelete,
  isPublishing,
  isDeleting,
}: EditorDeskGridProps) {
  return (
    <div className="editor-desk-grid">
      <article className="editor-desk-item">
        <Link to="/editor/write" className="editor-desk-create" aria-label="Create new article">
          <Plus className="editor-desk-create__icon" strokeWidth={1.75} aria-hidden />
          <span className="editor-desk-create__label">New article</span>
        </Link>
        <div className="editor-desk-item__meta">
          <p className="editor-desk-item__title">Create</p>
          <p className="editor-desk-item__subtitle">Block editor</p>
        </div>
      </article>

      {drafts.map((draft) => {
        const title = draft.title?.trim() || 'Untitled draft'

        return (
          <article key={draft.id} className="editor-desk-item group">
            <div className="editor-desk-card">
              <Link
                to={`/editor/write/${draft.id}`}
                className="editor-desk-card__link"
                aria-label={`Edit ${title}`}
              >
                <DraftPreviewSurface draft={draft} />
              </Link>

              <div className="editor-desk-card__actions">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      className="editor-desk-card__menu h-8 w-8"
                      aria-label={`Actions for ${title}`}
                      onClick={(event) => event.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="editor-desk-card__menu-content w-40">
                    <DropdownMenuItem asChild className="editor-desk-card__menu-item">
                      <Link to={`/editor/write/${draft.id}`}>Edit</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="editor-desk-card__menu-item"
                      disabled={isPublishing}
                      onClick={() => onPublish(draft.id)}
                    >
                      <Upload className="editor-desk-card__menu-icon" />
                      Publish
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="editor-desk-card__menu-item editor-desk-card__menu-item--danger"
                      disabled={isDeleting}
                      onClick={() => onDelete(draft.id)}
                    >
                      <Trash2 className="editor-desk-card__menu-icon" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="editor-desk-item__meta">
              <p className={cn('editor-desk-item__title', !draft.title?.trim() && 'text-muted-foreground')}>
                {title}
              </p>
              <p className="editor-desk-item__subtitle">{draftMeta(draft)}</p>
            </div>
          </article>
        )
      })}
    </div>
  )
}
