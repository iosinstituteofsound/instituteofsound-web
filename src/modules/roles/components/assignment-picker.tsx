import { X } from 'lucide-react'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'

export interface AssignmentOption {
  id: string
  label: string
}

interface AssignmentPickerProps {
  title: string
  options: AssignmentOption[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
  emptyText?: string
}

export function AssignmentPicker({
  title,
  options,
  selectedIds,
  onChange,
  emptyText = 'Nothing assigned',
}: AssignmentPickerProps) {
  const selectedSet = new Set(selectedIds)
  const selectedOptions = selectedIds
    .map((id) => options.find((option) => option.id === id))
    .filter((option): option is AssignmentOption => Boolean(option))
  const availableOptions = options.filter((option) => !selectedSet.has(option.id))

  const addId = (id: string) => {
    if (!id || selectedSet.has(id)) return
    onChange([...selectedIds, id])
  }

  const removeId = (id: string) => {
    onChange(selectedIds.filter((selectedId) => selectedId !== id))
  }

  return (
    <div className="space-y-3 rounded-md border p-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">{title}</h3>
        <span className="text-xs text-muted-foreground">{selectedIds.length} assigned</span>
      </div>

      <div className="flex min-h-8 flex-wrap gap-2">
        {selectedOptions.length === 0 ? (
          <span className="text-sm text-muted-foreground">{emptyText}</span>
        ) : (
          selectedOptions.map((option) => (
            <Badge key={option.id} variant="secondary" className="gap-1 pr-1">
              {option.label}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-4 w-4 hover:bg-transparent"
                onClick={() => removeId(option.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))
        )}
      </div>

      {availableOptions.length > 0 && (
        <div className="flex gap-2">
          <Select onValueChange={addId}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder={`Add ${title.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {availableOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
}
