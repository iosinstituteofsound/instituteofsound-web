import { LayoutTemplate, Loader2, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { ArticleTemplatePreview } from '@/modules/editor/components/article-template-preview'
import { useArticleTemplates } from '@/modules/editor/hooks/use-article-templates'
import { usePublishConfig } from '@/modules/editor/hooks/use-publish-config'
import type { ArticlePuckDocument } from '@/modules/editor/types/article-editor.types'
import type { ArticleTemplateDto } from '@/modules/editor/types/article-template.types'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { cn } from '@/shared/lib/cn'

interface ArticleTemplatesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (document: ArticlePuckDocument) => void
}

function TemplateCard({
  template,
  onSelect,
  onDelete,
  deleting,
}: {
  template: ArticleTemplateDto
  onSelect: () => void
  onDelete?: () => void
  deleting?: boolean
}) {
  return (
    <article className="article-template-card group">
      <button
        type="button"
        className="article-template-card__select"
        onClick={onSelect}
      >
        <ArticleTemplatePreview template={template} />
        <span className="article-template-card__overlay">
          <span className="article-template-card__cta">Use this style</span>
        </span>
      </button>

      <div className="article-template-card__meta">
        <div className="flex items-start gap-2">
          <LayoutTemplate className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <p className="font-medium leading-tight">{template.name}</p>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {template.description || 'No description'}
            </p>
          </div>
          <span className="shrink-0 text-[10px] uppercase tracking-wider text-muted-foreground">
            {template.source}
          </span>
        </div>
        <p className="mt-2 text-xs uppercase tracking-wider text-muted-foreground">{template.category}</p>
      </div>

      {onDelete ? (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="article-template-card__delete h-8 text-destructive hover:text-destructive"
          onClick={onDelete}
          disabled={deleting}
        >
          {deleting ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Trash2 className="mr-1.5 h-3.5 w-3.5" />}
          Delete
        </Button>
      ) : null}
    </article>
  )
}

export function ArticleTemplatesDialog({ open, onOpenChange, onSelect }: ArticleTemplatesDialogProps) {
  const [category, setCategory] = useState<string>('all')
  const { templates, isLoading, isError, deleteTemplate, isDeleting, prepareSelectedTemplate } =
    useArticleTemplates()
  const { data: publishConfig } = usePublishConfig()

  const categories = publishConfig?.templateCategories ?? [
    { value: 'feature', label: 'Feature' },
    { value: 'review', label: 'Review' },
    { value: 'interview', label: 'Interview' },
    { value: 'photo', label: 'Photo essay' },
  ]

  const allTemplates = useMemo(() => {
    const system = templates?.system ?? []
    const saved = templates?.saved ?? []
    const orderedSystem = [...system].sort((a, b) => {
      if (a.id === 'system-blank') return 1
      if (b.id === 'system-blank') return -1
      if (a.id === 'system-feature-story') return -1
      if (b.id === 'system-feature-story') return 1
      return 0
    })
    return [...orderedSystem, ...saved]
  }, [templates])

  const filtered = useMemo(() => {
    if (category === 'all') return allTemplates
    return allTemplates.filter((template) => template.category === category)
  }, [allTemplates, category])

  const handleSelect = (template: ArticleTemplateDto) => {
    onSelect(prepareSelectedTemplate(template))
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent elevated className="max-h-[90vh] max-w-5xl overflow-hidden">
        <DialogHeader>
          <DialogTitle>Article templates</DialogTitle>
          <DialogDescription>
            Live page styles — pick a layout, apply it to your workspace, then edit every block.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={cn(
              'rounded-full border px-3 py-1 text-xs uppercase tracking-wider',
              category === 'all' && 'border-primary text-primary',
            )}
            onClick={() => setCategory('all')}
          >
            All
          </button>
          {categories.map((item) => (
            <button
              key={item.value}
              type="button"
              className={cn(
                'rounded-full border px-3 py-1 text-xs uppercase tracking-wider',
                category === item.value && 'border-primary text-primary',
              )}
              onClick={() => setCategory(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="max-h-[62vh] overflow-y-auto pr-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading templates…
            </div>
          ) : null}

          {isError ? (
            <p className="py-8 text-center text-sm text-destructive">Could not load templates from API.</p>
          ) : null}

          {!isLoading && !isError ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onSelect={() => handleSelect(template)}
                  onDelete={
                    template.source === 'saved'
                      ? () => void deleteTemplate(template.id)
                      : undefined
                  }
                  deleting={isDeleting}
                />
              ))}
              {!filtered.length ? (
                <p className="col-span-full py-8 text-center text-sm text-muted-foreground">
                  No templates in this category.
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
