import { ExternalLink, MoreHorizontal, PenLine, Plus, Trash2, Upload } from 'lucide-react'
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

function articleMeta(article: ArticleDto, variant: 'desk' | 'published') {
  if (variant === 'published') {
    const dateSource = article.publishedAt ?? article.updatedAt
    if (dateSource) {
      const published = new Date(dateSource)
      const label = published.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      return `Published · ${label}`
    }
    return 'Published'
  }

  if (article.updatedAt) {
    const edited = new Date(article.updatedAt)
    const label = edited.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    return `Draft · ${label}`
  }
  if (article.type) return ARTICLE_TYPE_LABELS[article.type] ?? article.type
  if (article.excerpt?.trim()) return article.excerpt.trim()
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
  articles: ArticleDto[]
  variant?: 'desk' | 'published'
  onPublish?: (id: string) => void
  onDelete: (id: string) => void
  isPublishing?: boolean
  isDeleting?: boolean
}

export function EditorDeskGrid({
  articles,
  variant = 'desk',
  onPublish,
  onDelete,
  isPublishing,
  isDeleting,
}: EditorDeskGridProps) {
  return (
    <div className="editor-desk-grid">
      {variant === 'desk' ? (
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
      ) : null}

      {articles.map((article) => {
        const title = article.title?.trim() || (variant === 'published' ? 'Untitled article' : 'Untitled draft')
        const liveHref = article.slug ? `/explore/articles/${article.slug}` : null

        return (
          <article key={article.id} className="editor-desk-item group">
            <div className="editor-desk-card">
              <Link
                to={variant === 'published' && liveHref ? liveHref : `/editor/write/${article.id}`}
                className="editor-desk-card__link"
                aria-label={variant === 'published' ? `View ${title}` : `Edit ${title}`}
              >
                <DraftPreviewSurface draft={article} />
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
                      <Link to={`/editor/write/${article.id}`}>Edit</Link>
                    </DropdownMenuItem>
                    {variant === 'published' && liveHref ? (
                      <DropdownMenuItem asChild className="editor-desk-card__menu-item">
                        <Link to={liveHref} target="_blank" rel="noreferrer">
                          <ExternalLink className="editor-desk-card__menu-icon" />
                          View live
                        </Link>
                      </DropdownMenuItem>
                    ) : null}
                    {variant === 'desk' && onPublish ? (
                      <DropdownMenuItem
                        className="editor-desk-card__menu-item"
                        disabled={isPublishing}
                        onClick={() => onPublish(article.id)}
                      >
                        <Upload className="editor-desk-card__menu-icon" />
                        Publish
                      </DropdownMenuItem>
                    ) : null}
                    <DropdownMenuItem
                      className="editor-desk-card__menu-item editor-desk-card__menu-item--danger"
                      disabled={isDeleting}
                      onClick={() => onDelete(article.id)}
                    >
                      <Trash2 className="editor-desk-card__menu-icon" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="editor-desk-item__meta">
              <p className={cn('editor-desk-item__title', !article.title?.trim() && 'text-muted-foreground')}>
                {title}
              </p>
              <p className="editor-desk-item__subtitle">{articleMeta(article, variant)}</p>
            </div>
          </article>
        )
      })}
    </div>
  )
}
