import { ArticleEditorEditPanel } from '@/modules/editor/components/article-editor-edit-panel'
import { ArticleEditorHistoryToolbar } from '@/modules/editor/components/article-editor-history-toolbar'
import { usePublishConfig } from '@/modules/editor/hooks/use-publish-config'
import type { CanvasPreviewMode } from '@/modules/editor/hooks/use-article-canvas-history'
import type { ArticleEditorMeta } from '@/modules/editor/types/article-editor.types'
import type { ArticleType } from '@/modules/explore/types/explore.types'
import { X } from 'lucide-react'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Switch } from '@/shared/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { Textarea } from '@/shared/components/ui/textarea'
import { FormGroupCard } from '@/shared/components/forms'
import type { Data } from '@measured/puck'
import { normalizeArticleSlug } from '@/modules/editor/lib/article-slug'
import { cn } from '@/shared/lib/cn'

const FALLBACK_ARTICLE_TYPES: { value: ArticleType; label: string }[] = [
  { value: 'feature', label: 'Feature' },
  { value: 'review', label: 'Review' },
  { value: 'single', label: 'Single' },
  { value: 'ep', label: 'EP' },
  { value: 'band_profile', label: 'Band profile' },
]

interface ArticleEditorSidebarProps {
  canvasData: Data
  selectedBlockIds: string[]
  deckEditActive?: boolean
  soundDnaEditActive?: boolean
  liveWorkspace?: boolean
  excerpt: string
  slug: string
  status: string
  meta: ArticleEditorMeta
  authorName: string
  className?: string
  onCanvasChange: (data: Data | ((prev: Data) => Data)) => void
  onSelectBlocks: (blockIds: string[]) => void
  onDeselectBlocks: () => void
  onExcerptChange: (value: string) => void
  onSlugChange: (value: string) => void
  onMetaChange: (patch: Partial<ArticleEditorMeta>) => void
  canUndo: boolean
  canRedo: boolean
  canRedoAll: boolean
  canRevert: boolean
  previewMode: CanvasPreviewMode
  onRevert: () => void
  onUndo: () => void
  onRedo: () => void
  onRedoAll: () => void
  onOriginalHoldStart: () => void
  onOriginalHoldEnd: () => void
  onCompareToggle: () => void
}

function TagInput({
  tags,
  onChange,
}: {
  tags: string[]
  onChange: (tags: string[]) => void
}) {
  const addTag = (raw: string) => {
    const tag = raw.trim()
    if (!tag || tags.includes(tag)) return
    onChange([...tags, tag])
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs"
          >
            {tag}
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => onChange(tags.filter((t) => t !== tag))}
              aria-label={`Remove ${tag}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <Input
        placeholder="Add tag and press Enter"
        onKeyDown={(e) => {
          if (e.key !== 'Enter') return
          e.preventDefault()
          addTag(e.currentTarget.value)
          e.currentTarget.value = ''
        }}
      />
    </div>
  )
}

export function ArticleEditorSidebar({
  canvasData,
  selectedBlockIds,
  deckEditActive = false,
  soundDnaEditActive = false,
  liveWorkspace = false,
  excerpt,
  slug,
  status,
  meta,
  authorName,
  className,
  onCanvasChange,
  onSelectBlocks,
  onDeselectBlocks,
  onExcerptChange,
  onSlugChange,
  onMetaChange,
  canUndo,
  canRedo,
  canRedoAll,
  canRevert,
  previewMode,
  onRevert,
  onUndo,
  onRedo,
  onRedoAll,
  onOriginalHoldStart,
  onOriginalHoldEnd,
  onCompareToggle,
}: ArticleEditorSidebarProps) {
  const { data: publishConfig } = usePublishConfig()
  const articleTypes = publishConfig?.articleTypes ?? FALLBACK_ARTICLE_TYPES
  const featuredFlags = publishConfig?.featuredFlags ?? [
    { key: 'isCoverStory', label: 'Cover story' },
    { key: 'wirePick', label: 'Wire pick' },
    { key: 'homepageHero', label: 'Homepage hero' },
    { key: 'trending', label: 'Trending' },
  ]
  const excerptMax = publishConfig?.excerptMaxLength ?? 500
  const excerptSeoRecommended = publishConfig?.excerptSeoRecommendedLength ?? 160
  const seoDescriptionMax = publishConfig?.seoDescriptionMaxLength ?? 320
  const seoTitleMax = publishConfig?.seoTitleMaxLength ?? 70

  return (
    <aside className={cn('flex w-[22rem] shrink-0 flex-col border-l border-border bg-card', className)}>
      <Tabs defaultValue="edit" className="flex min-h-0 flex-1 flex-col">
        <div className="border-b border-border px-4 pt-4">
          <TabsList className="grid w-full grid-cols-3 bg-muted">
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="publish">Publish</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
          <TabsContent value="edit" className="mt-0">
            <ArticleEditorEditPanel
              data={canvasData}
              selectedBlockIds={selectedBlockIds}
              deckEditActive={deckEditActive}
              soundDnaEditActive={soundDnaEditActive}
              liveWorkspace={liveWorkspace}
              meta={meta}
              slug={slug}
              excerpt={excerpt}
              excerptMax={excerptMax}
              onChange={onCanvasChange}
              onSelectBlocks={onSelectBlocks}
              onDeselectBlocks={onDeselectBlocks}
              onExcerptChange={onExcerptChange}
              onMetaChange={onMetaChange}
            />
          </TabsContent>

          <TabsContent value="publish" className="mt-0 space-y-5">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} disabled>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Author</Label>
              <div className="rounded-lg border border-border bg-background px-3 py-2 text-sm">{authorName}</div>
            </div>

            <div className="space-y-2">
              <Label>Article type</Label>
              <Select value={meta.type} onValueChange={(value) => onMetaChange({ type: value as ArticleType })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {articleTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>URL slug</Label>
              <Input
                value={slug}
                onChange={(e) => onSlugChange(normalizeArticleSlug(e.target.value))}
                placeholder="cathedral-of-noise"
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
              />
              <p className="text-xs text-muted-foreground">
                /explore/articles/{slug || 'your-slug'}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Excerpt</Label>
              <Textarea
                value={excerpt}
                onChange={(e) => onExcerptChange(e.target.value)}
                placeholder="Short summary for cards and search…"
                maxLength={excerptMax}
                rows={4}
              />
              <p className="text-right text-xs text-muted-foreground">
                {excerpt.length}/{excerptMax}
                {excerpt.length > 0 && excerpt.length <= excerptSeoRecommended ? (
                  <span className="ml-2 text-primary">SEO sweet spot</span>
                ) : null}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <TagInput tags={meta.tags} onChange={(tags) => onMetaChange({ tags })} />
            </div>

            <FormGroupCard title="Featured">
              {featuredFlags.map((item) => (
                <label key={item.key} className="flex items-center justify-between gap-3 text-sm">
                  <span>{item.label}</span>
                  <Switch
                    checked={meta[item.key as keyof ArticleEditorMeta] as boolean}
                    onCheckedChange={(checked) =>
                      onMetaChange({ [item.key]: checked } as Partial<ArticleEditorMeta>)
                    }
                  />
                </label>
              ))}
            </FormGroupCard>

            <div className="space-y-2">
              <Label>Session audio URL</Label>
              <Input
                value={meta.sessionAudioUrl}
                onChange={(e) => onMetaChange({ sessionAudioUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label>Session label</Label>
              <Input
                value={meta.sessionLabel}
                onChange={(e) => onMetaChange({ sessionLabel: e.target.value })}
                placeholder="Listen to the session"
              />
            </div>
          </TabsContent>

          <TabsContent value="seo" className="mt-0 space-y-5">
            <div className="space-y-2">
              <Label>SEO title</Label>
              <Input
                value={meta.seoTitle}
                onChange={(e) => onMetaChange({ seoTitle: e.target.value })}
                placeholder="Custom search title"
                maxLength={seoTitleMax}
              />
              <p className="text-right text-xs text-muted-foreground">
                {meta.seoTitle.length}/{seoTitleMax}
              </p>
            </div>
            <div className="space-y-2">
              <Label>SEO description</Label>
              <Textarea
                value={meta.seoDescription}
                onChange={(e) => onMetaChange({ seoDescription: e.target.value })}
                placeholder="Meta description for search and social"
                rows={5}
                maxLength={seoDescriptionMax}
              />
              <p className={cn('text-right text-xs text-muted-foreground')}>
                {meta.seoDescription.length}/{seoDescriptionMax}
              </p>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      <ArticleEditorHistoryToolbar
        canUndo={canUndo}
        canRedo={canRedo}
        canRedoAll={canRedoAll}
        canRevert={canRevert}
        previewMode={previewMode}
        onRevert={onRevert}
        onUndo={onUndo}
        onRedo={onRedo}
        onRedoAll={onRedoAll}
        onOriginalHoldStart={onOriginalHoldStart}
        onOriginalHoldEnd={onOriginalHoldEnd}
        onCompareToggle={onCompareToggle}
      />
    </aside>
  )
}
