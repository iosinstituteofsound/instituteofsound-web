import { useRef, useState } from 'react'
import clsx from 'clsx'
import { isCloudinaryConfigured } from '@/lib/cloudinary/config'
import {
  uploadImageToCloudinary,
  validateImageFile,
  type CloudinaryFolder,
} from '@/lib/cloudinary/upload'
import { IOSImage } from '@/components/ui/IOSImage'
import { FieldLabel, Input } from '@/components/ui/Input'

interface ImageUploadProps {
  label: string
  folder: CloudinaryFolder
  value?: string
  onChange: (url: string) => void
  hint?: string
}

export function ImageUpload({ label, folder, value, onChange, hint }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)

  const configured = isCloudinaryConfigured()

  const processFile = async (file: File) => {
    setError('')
    const validation = validateImageFile(file)
    if (validation) {
      setError(validation)
      return
    }
    setUploading(true)
    try {
      const result = await uploadImageToCloudinary(file, folder)
      onChange(result.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) void processFile(file)
    e.target.value = ''
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) void processFile(file)
  }

  if (!configured) {
    return (
      <div>
        <FieldLabel>{label}</FieldLabel>
        {hint && <p className="text-xs text-muted mb-2">{hint}</p>}
        <p className="text-xs text-muted mb-2">
          Cloudinary not configured — paste an image URL for local demo.
        </p>
        <Input
          type="url"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://images.unsplash.com/…"
        />
        {value ? (
          <IOSImage
            src={value}
            alt="Preview"
            width={640}
            className="mt-3 w-full h-40 object-cover border border-border"
          />
        ) : null}
      </div>
    )
  }

  return (
    <div>
      <label className="ios-label">{label}</label>
      {hint && <p className="text-xs text-muted mb-2">{hint}</p>}

      {value ? (
        <div className="relative border border-border overflow-hidden ios-card">
          <IOSImage src={value} alt="Upload preview" width={640} className="w-full h-48 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-void/90 to-transparent pointer-events-none" />
          <div className="absolute bottom-3 left-3 right-3 flex gap-2">
            <button
              type="button"
              className="ios-btn ios-btn-secondary !py-2 !px-3 flex-1"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              Replace
            </button>
            <button
              type="button"
              className="ios-btn ios-btn-ghost !py-2 !px-3"
              onClick={() => onChange('')}
              disabled={uploading}
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={clsx(
            'border-2 border-dashed p-8 text-center cursor-pointer transition-colors',
            dragOver ? 'border-mh-red bg-mh-red/5' : 'border-border hover:border-mh-red/50',
          )}
        >
          <p className="text-sm text-signal font-medium">
            {uploading ? 'Uploading to Cloudinary…' : 'Drop image or click to upload'}
          </p>
          <p className="text-[10px] text-muted mt-2 uppercase tracking-widest">
            JPG · PNG · WebP · max 10MB
          </p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        className="hidden"
        onChange={onFileChange}
      />

      {error && <p className="text-mh-red text-xs mt-2">{error}</p>}
    </div>
  )
}
