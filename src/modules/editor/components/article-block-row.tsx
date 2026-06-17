import { Trash2 } from 'lucide-react'
import type { Data } from '@measured/puck'
import { InlineRichText } from '@/modules/editor/components/inline-rich-text'
import { InlineImageBlock } from '@/modules/editor/components/inline-image-block'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'

interface ArticleBlockRowProps {
  block: Data['content'][number]
  index: number
  canDelete: boolean
  onUpdate: (patch: Record<string, unknown>) => void
  onDelete: () => void
}

export function ArticleBlockRow({ block, index, canDelete, onUpdate, onDelete }: ArticleBlockRowProps) {
  const showDelete = canDelete && block.type !== 'ArticleTitle'

  return (
    <div className="group relative" data-block-index={index}>
      {showDelete ? (
        <div className="absolute -right-2 top-0 z-10 opacity-0 transition-opacity group-hover:opacity-100 md:-right-10">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={onDelete}
            aria-label="Remove block"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ) : null}

      {block.type === 'ArticleTitle' ? (
        <textarea
          value={(block.props.text as string) ?? ''}
          onChange={(e) => onUpdate({ text: e.target.value })}
          placeholder="Article title"
          rows={2}
          className={cn(
            'w-full resize-none bg-transparent font-serif text-4xl font-bold leading-tight tracking-tight',
            'text-foreground placeholder:text-muted-foreground/60 focus:outline-none md:text-5xl',
          )}
        />
      ) : null}

      {block.type === 'ArticleLead' ? (
        <InlineRichText
          value={(block.props.body as string) ?? ''}
          onChange={(body) => onUpdate({ body })}
          placeholder="Opening paragraph…"
          proseClassName="prose prose-lg dark:prose-invert max-w-none font-serif text-muted-foreground"
        />
      ) : null}

      {block.type === 'ArticleBody' ? (
        <InlineRichText
          value={(block.props.body as string) ?? ''}
          onChange={(body) => onUpdate({ body })}
          placeholder="Write your editorial…"
          proseClassName="prose prose-base dark:prose-invert max-w-none font-serif text-foreground"
        />
      ) : null}

      {block.type === 'ArticleSection' ? (
        <section data-article-section className="space-y-3">
          <input
            value={(block.props.heading as string) ?? ''}
            onChange={(e) => onUpdate({ heading: e.target.value })}
            placeholder="Section heading"
            className="w-full bg-transparent font-serif text-2xl font-bold text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
          />
          <InlineRichText
            value={(block.props.body as string) ?? ''}
            onChange={(body) => onUpdate({ body })}
            placeholder="Section content…"
          />
        </section>
      ) : null}

      {block.type === 'ArticleHero' || block.type === 'ArticleImage' ? (
        <figure className="space-y-2">
          <InlineImageBlock
            imageUrl={(block.props.imageUrl as string) ?? ''}
            onChange={(imageUrl) => onUpdate({ imageUrl })}
            aspect={block.type === 'ArticleHero' ? 'video' : 'auto'}
          />
          <input
            value={(block.props.caption as string) ?? ''}
            onChange={(e) => onUpdate({ caption: e.target.value })}
            placeholder="Caption (optional)"
            className="w-full bg-transparent text-sm text-muted-foreground placeholder:text-muted-foreground/60 focus:outline-none"
          />
        </figure>
      ) : null}

      {block.type === 'ArticleDivider' ? <hr className="border-border" /> : null}
    </div>
  )
}
