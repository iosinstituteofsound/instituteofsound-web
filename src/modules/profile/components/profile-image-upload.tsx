import { useRef, useState } from 'react'
import { ImagePlus, Loader2, X } from 'lucide-react'
import { uploadMediaFile } from '@/modules/feed/api/media.api'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'
import { toast } from '@/shared/components/ui/sonner'

type ProfileImageUploadProps = {
  label: string
  description?: string
  value?: string
  aspect?: 'square' | 'cover'
  onChange: (url: string | null) => void
  disabled?: boolean
}

export function ProfileImageUpload({
  label,
  description,
  value,
  aspect = 'square',
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
    <div className="space-y-2">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      </div>

      <div
        className={cn(
          'relative overflow-hidden rounded-xl border border-dashed border-border/80 bg-muted/30',
          aspect === 'cover' ? 'h-36 w-full sm:h-44' : 'h-28 w-28',
        )}
      >
        {value ? (
          <img src={value} alt={label} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ImagePlus className="h-8 w-8 opacity-60" />
          </div>
        )}

        {uploading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
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
