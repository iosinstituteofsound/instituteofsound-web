import { useRef, useState } from 'react'
import { ImagePlus, Loader2 } from 'lucide-react'
import { uploadMediaFile } from '@/modules/feed/api/media.api'
import { toast } from '@/shared/components/ui/sonner'

type PlaylistCoverUploadProps = {
  value?: string
  onChange: (url: string | null) => void
  disabled?: boolean
}

export function PlaylistCoverUpload({ value, onChange, disabled }: PlaylistCoverUploadProps) {
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
      toast.success('Cover updated')
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
    <div className="playlist-cover-upload">
      <button
        type="button"
        disabled={disabled || uploading}
        className="playlist-cover-upload__preview"
        onClick={() => inputRef.current?.click()}
        aria-label={value ? 'Change cover art' : 'Upload cover art'}
      >
        {value ? (
          <img src={value} alt="" className="playlist-cover-upload__image" />
        ) : (
          <span className="playlist-cover-upload__empty">
            <ImagePlus size={28} strokeWidth={1.5} aria-hidden />
            <span>Upload cover</span>
          </span>
        )}

        {uploading ? (
          <span className="playlist-cover-upload__loading">
            <Loader2 size={22} className="animate-spin" aria-hidden />
          </span>
        ) : (
          <span className="playlist-cover-upload__overlay">{value ? 'Change cover' : 'Add cover'}</span>
        )}
      </button>

      <p className="playlist-cover-upload__hint">Square · PNG or JPG</p>

      {value ? (
        <button
          type="button"
          className="playlist-cover-upload__remove"
          disabled={disabled || uploading}
          onClick={() => onChange(null)}
        >
          Remove cover
        </button>
      ) : null}

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
