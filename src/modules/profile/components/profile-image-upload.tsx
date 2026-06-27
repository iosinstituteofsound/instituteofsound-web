import { useRef, useState } from 'react'
import { ImagePlus, Loader2, X } from 'lucide-react'
import { uploadMediaFile } from '@/modules/feed/api/media.api'
import { Button } from '@/shared/components/ui/button'
import { FileDropzone } from '@/shared/components/forms'
import { cn } from '@/shared/lib/cn'
import { toast } from '@/shared/components/ui/sonner'

type ProfileImageUploadProps = {
  label: string
  description?: string
  value?: string
  aspect?: 'square' | 'cover'
  size?: 'sm' | 'lg'
  onChange: (url: string | null) => void
  disabled?: boolean
}

const squareSizeClass = {
  sm: 'h-28 w-28',
  lg: 'mx-auto aspect-square w-[min(100%,14rem)] sm:mx-0 sm:size-48 md:size-52 lg:size-56',
} as const

export function ProfileImageUpload({
  label,
  description,
  value,
  aspect = 'square',
  size = 'sm',
  onChange,
  disabled,
}: ProfileImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file')
      return
    }

    setUploading(true)
    try {
      const uploaded = await uploadMediaFile(file, file.name)
      onChange(uploaded.absoluteUrl ?? uploaded.url)
      toast.success(`${label} updated`)
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Upload failed'
      toast.error(message)
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className={cn('space-y-2', size === 'lg' && 'flex flex-col items-center md:items-start')}>
      <div>
        <p className="text-sm font-medium">{label}</p>
        {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      </div>

      {value ? (
        <button
          type="button"
          disabled={disabled || uploading}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'relative block overflow-hidden rounded-xl border border-dashed border-border/80 bg-muted/30 transition-colors hover:bg-muted/45 disabled:pointer-events-none disabled:opacity-60',
            aspect === 'cover' ? 'h-36 w-full sm:h-44' : squareSizeClass[size],
          )}
        >
          <img src={value} alt={label} className="h-full w-full object-cover" />

          {uploading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-background/70">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : null}
        </button>
      ) : (
        <FileDropzone
          onFiles={(files) => {
            const file = files[0]
            if (file) void handleFile(file)
          }}
          accept="image/*"
          disabled={disabled || uploading}
          icon={<ImagePlus className={cn('opacity-60', size === 'lg' ? 'h-10 w-10' : 'h-8 w-8')} />}
          title="Click to upload"
          description={description}
          className={cn(
            aspect === 'cover' ? 'h-36 w-full sm:h-44' : squareSizeClass[size],
            'border-border/80 bg-muted/30 hover:bg-muted/45',
          )}
          aria-label={label}
        />
      )}

      <div className={cn('flex flex-wrap gap-2', size === 'lg' && 'justify-center md:justify-start')}>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || uploading}
          onClick={() => inputRef.current?.click()}
        >
          {value ? 'Change' : 'Upload'}
        </Button>
        {value ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled || uploading}
            onClick={() => onChange(null)}
          >
            <X className="h-4 w-4" />
            Remove
          </Button>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) void handleFile(file)
        }}
      />
    </div>
  )
}
