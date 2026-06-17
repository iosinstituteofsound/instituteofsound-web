import { useRef, useState } from 'react'
import { ImageIcon, Loader2, Upload } from 'lucide-react'
import { uploadMediaFile } from '@/modules/feed/api/media.api'
import { cn } from '@/shared/lib/cn'

interface InlineImageBlockProps {
  imageUrl: string
  onChange: (url: string) => void
  aspect?: 'video' | 'auto'
  wrapperStyle?: React.CSSProperties
  imgStyle?: React.CSSProperties
  placeholderStyle?: React.CSSProperties
  /** When false, canvas shows image only — upload/replace lives in the sidebar tool panel. */
  interactive?: boolean
}

export function InlineImageBlock({
  imageUrl,
  onChange,
  aspect = 'auto',
  wrapperStyle,
  imgStyle,
  placeholderStyle,
  interactive = true,
}: InlineImageBlockProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleFile = async (file: File) => {
    if (uploading) return
    setUploading(true)
    try {
      const uploaded = await uploadMediaFile(file, file.name)
      onChange(uploaded.url)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void handleFile(file)
          e.target.value = ''
        }}
      />

      {imageUrl ? (
        interactive ? (
          <button
            type="button"
            className="group relative block w-full overflow-hidden"
            style={wrapperStyle}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation()
              inputRef.current?.click()
            }}
          >
            <img
              src={imageUrl}
              alt=""
              className={cn('w-full', aspect === 'video' && 'aspect-video')}
              style={imgStyle}
            />
            <span className="absolute inset-0 flex items-center justify-center bg-background/60 opacity-0 transition-opacity group-hover:opacity-100">
              <Upload className="mr-2 h-4 w-4" />
              Replace
            </span>
          </button>
        ) : (
          <div className="block w-full overflow-hidden" style={wrapperStyle}>
            <img
              src={imageUrl}
              alt=""
              draggable={false}
              className={cn('w-full pointer-events-none select-none', aspect === 'video' && 'aspect-video')}
              style={imgStyle}
            />
          </div>
        )
      ) : interactive ? (
        <button
          type="button"
          className={cn(
            'flex w-full flex-col items-center justify-center gap-2 border border-dashed border-border',
            'bg-muted/20 text-sm text-muted-foreground transition-colors hover:border-primary hover:bg-muted/40',
            aspect === 'video' ? 'aspect-video' : 'h-48',
          )}
          style={placeholderStyle}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            inputRef.current?.click()
          }}
        >
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <ImageIcon className="h-5 w-5" />
          )}
          Tap to add image
        </button>
      ) : (
        <div
          className={cn(
            'flex w-full flex-col items-center justify-center gap-2 border border-dashed border-border/60',
            'bg-muted/10 text-xs text-muted-foreground/70',
            aspect === 'video' ? 'aspect-video' : 'h-48',
          )}
          style={placeholderStyle}
        >
          <ImageIcon className="h-5 w-5 opacity-50" />
          <span>Use sidebar to add image</span>
        </div>
      )}
    </div>
  )
}
