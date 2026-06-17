import { ImageIcon, Minus, Plus, Rows3, Type } from 'lucide-react'
import type { ArticlePuckComponents } from '@/modules/editor/lib/article-puck-config'
import { Button } from '@/shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'

type BlockType = keyof ArticlePuckComponents

const BLOCK_OPTIONS: Array<{ type: BlockType; label: string; icon: typeof Type }> = [
  { type: 'ArticleBody', label: 'Paragraph', icon: Type },
  { type: 'ArticleImage', label: 'Image', icon: ImageIcon },
  { type: 'ArticleHero', label: 'Hero image', icon: ImageIcon },
  { type: 'ArticleSection', label: 'Section', icon: Rows3 },
  { type: 'ArticleDivider', label: 'Divider', icon: Minus },
]

interface ArticleAddBlockMenuProps {
  onAdd: (type: BlockType) => void
}

export function ArticleAddBlockMenu({ onAdd }: ArticleAddBlockMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="rounded-full">
          <Plus className="mr-1.5 h-4 w-4" />
          Add block
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {BLOCK_OPTIONS.map((option) => (
          <DropdownMenuItem key={option.type} onClick={() => onAdd(option.type)}>
            <option.icon className="mr-2 h-4 w-4" />
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
