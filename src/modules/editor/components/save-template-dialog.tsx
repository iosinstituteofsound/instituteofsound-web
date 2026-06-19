import { useState } from 'react'
import type { ArticlePuckDocument } from '@/modules/editor/types/article-editor.types'
import type { ArticleTemplateCategory } from '@/modules/editor/types/article-template.types'
import { serializePuckDocument } from '@/modules/editor/lib/article-puck-data'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Textarea } from '@/shared/components/ui/textarea'

interface SaveTemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  puckDocument: ArticlePuckDocument
  categories: Array<{ value: string; label: string }>
  isSaving: boolean
  onSave: (input: {
    name: string
    description: string
    category: ArticleTemplateCategory
    puckDocument: Record<string, unknown>
  }) => Promise<unknown>
}

export function SaveTemplateDialog({
  open,
  onOpenChange,
  puckDocument,
  categories,
  isSaving,
  onSave,
}: SaveTemplateDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<ArticleTemplateCategory>('feature')

  const handleSave = async () => {
    if (!name.trim()) return
    await onSave({
      name: name.trim(),
      description: description.trim(),
      category,
      puckDocument: serializePuckDocument(puckDocument),
    })
    setName('')
    setDescription('')
    setCategory('feature')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent elevated className="max-w-md">
        <DialogHeader>
          <DialogTitle>Save as template</DialogTitle>
          <DialogDescription>
            Store this layout and block structure for your next article.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="template-name">Template name</Label>
            <Input
              id="template-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Underground feature"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="template-description">Description</Label>
            <Textarea
              id="template-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="When to use this template"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={(value) => setCategory(value as ArticleTemplateCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="button" onClick={() => void handleSave()} disabled={!name.trim() || isSaving}>
            {isSaving ? 'Saving…' : 'Save template'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
