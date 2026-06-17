import { LayoutTemplate, Loader2, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
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
    <div className="rounded-xl border border-border bg-card p-4">
      <button
        type="button"
        className="w-full text-left transition-colors hover:opacity-90"
        onClick={onSelect}
      >
        <div className="mb-2 flex items-center gap-2">
          <LayoutTemplate className="h-4 w-4 text-primary" />
          <span className="font-medium">{template.name}</span>
          <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground">
            {template.source}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{template.description || 'No description'}</p>
        <p className="mt-2 text-xs uppercase tracking-wider text-muted-foreground">{template.category}</p>
      </button>
      {onDelete ? (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="mt-3 h-8 text-destructive hover:text-destructive"
          onClick={onDelete}
          disabled={deleting}
        >
          {deleting ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Trash2 className="mr-1.5 h-3.5 w-3.5" />}
          Delete
        </Button>
      ) : null}
    </div>
  )
}

export function ArticleTemplatesDialog({ open, onOpenChange, onSelect }: ArticleTemplatesDialogProps) {
  const [category, setCategory] = useState<string>('all')
  const { templates, isLoading, isError, deleteTemplate, isDeleting, normalizeTemplateDocument } =
    useArticleTemplates()
  const { data: publishConfig } = usePublishConfig()

  const categories = publishConfig?.templateCategories ?? [
    { value: 'feature', label: 'Feature' },
    { value: 'review', label: 'Review' },
    { value: 'interview', label: 'Interview' },
    { value: 'photo', label: 'Photo essay' },
  ]

  const allTemplates = useMemo(
    () => [...(templates?.system ?? []), ...(templates?.saved ?? [])],
    [templates],
  )

  const filtered = useMemo(() => {
    if (category === 'all') return allTemplates
    return allTemplates.filter((template) => template.category === category)
  }, [allTemplates, category])

  const handleSelect = (template: ArticleTemplateDto) => {
    onSelect(normalizeTemplateDocument(template.puckDocument))
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-3xl overflow-hidden">
        <DialogHeader>
          <DialogTitle>Article templates</DialogTitle>
          <DialogDescription>
            API-driven layouts — system starters plus your saved templates.
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

        <div className="max-h-[50vh] overflow-y-auto">
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
            <div className="grid gap-3 sm:grid-cols-2">
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
