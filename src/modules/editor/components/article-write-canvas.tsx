import type { Data } from '@measured/puck'
import { ArticleAddBlockMenu } from '@/modules/editor/components/article-add-block-menu'
import { ArticleBlockRow } from '@/modules/editor/components/article-block-row'
import type { ArticlePuckComponents } from '@/modules/editor/lib/article-puck-config'
import { appendBlock, removeBlockAt, updateBlockProps } from '@/modules/editor/lib/puck-block-utils'

interface ArticleWriteCanvasProps {
  data: Data
  onChange: (data: Data) => void
}

export function ArticleWriteCanvas({ data, onChange }: ArticleWriteCanvasProps) {
  const handleUpdate = (index: number, patch: Record<string, unknown>) => {
    onChange(updateBlockProps(data, index, patch))
  }

  const handleDelete = (index: number) => {
    onChange(removeBlockAt(data, index))
  }

  const handleAdd = (type: keyof ArticlePuckComponents) => {
    onChange(appendBlock(data, type))
  }

  return (
    <div className="article-write-canvas mx-auto w-full max-w-3xl px-4 py-8 md:px-8 md:py-12">
      <div className="space-y-8">
        {data.content.map((block, index) => (
          <ArticleBlockRow
            key={`${block.type}-${index}`}
            block={block}
            index={index}
            canDelete={data.content.length > 1}
            onUpdate={(patch) => handleUpdate(index, patch)}
            onDelete={() => handleDelete(index)}
          />
        ))}
      </div>

      <div className="mt-10 flex items-center gap-3 border-t border-border/60 pt-6">
        <ArticleAddBlockMenu onAdd={handleAdd} />
        <p className="text-xs text-muted-foreground">Tap a block above to edit directly</p>
      </div>
    </div>
  )
}
