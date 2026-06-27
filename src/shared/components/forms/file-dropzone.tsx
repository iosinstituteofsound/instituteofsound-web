import type { DragEvent, ReactNode, Ref } from 'react'
import { Upload } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

interface FileDropzoneProps {
  onFiles: (files: FileList) => void
  accept?: string
  multiple?: boolean
  disabled?: boolean
  isDragActive?: boolean
  onDragStateChange?: (active: boolean) => void
  title?: ReactNode
  description?: ReactNode
  icon?: ReactNode
  className?: string
  inputRef?: Ref<HTMLInputElement>
  'aria-label'?: string
}

export function FileDropzone({
  onFiles,
  accept,
  multiple = false,
  disabled = false,
  isDragActive: controlledDragActive,
  onDragStateChange,
  title = 'Drop files here',
  description = 'or click to browse',
  icon,
  className,
  inputRef,
  'aria-label': ariaLabel,
}: FileDropzoneProps) {
  const handleDrag = (event: DragEvent, active: boolean) => {
    event.preventDefault()
    event.stopPropagation()
    if (disabled) return
    onDragStateChange?.(active)
  }

  const handleDrop = (event: DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
    onDragStateChange?.(false)
    if (disabled || !event.dataTransfer.files.length) return
    onFiles(event.dataTransfer.files)
  }

  const dragActive = controlledDragActive ?? false

  return (
    <label
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors',
        dragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/30',
        disabled && 'pointer-events-none opacity-60',
        className,
      )}
      aria-label={ariaLabel}
      onDragEnter={(e) => handleDrag(e, true)}
      onDragOver={(e) => handleDrag(e, true)}
      onDragLeave={(e) => handleDrag(e, false)}
      onDrop={handleDrop}
    >
      {icon ?? <Upload className="h-8 w-8 text-muted-foreground" />}
      {title ? <p className="text-sm font-medium">{title}</p> : null}
      {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={(e) => {
          if (e.target.files?.length) onFiles(e.target.files)
          e.target.value = ''
        }}
      />
    </label>
  )
}
