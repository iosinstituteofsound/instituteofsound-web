import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import { IOSImage } from '@/components/ui/IOSImage'
import {
  uploadImageToCloudinary,
  validateImageFile,
  type CloudinaryFolder,
} from '@/lib/cloudinary/upload'
import type { ProfilePhotoKind } from '@/lib/network/profilePhotoHistory'

const FOLDER: Record<ProfilePhotoKind, CloudinaryFolder> = {
  avatar: 'ios/artists',
  cover: 'ios/community',
}

interface ProfilePhotoPickerModalProps {
  open: boolean
  kind: ProfilePhotoKind
  title: string
  currentUrl?: string
  suggestions: string[]
  saving?: boolean
  onClose: () => void
  onSelect: (url: string) => void | Promise<void>
}

export function ProfilePhotoPickerModal({
  open,
  kind,
  title,
  currentUrl,
  suggestions,
  saving = false,
  onClose,
  onSelect,
}: ProfilePhotoPickerModalProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)

  useEffect(() => {
    if (!open) return
    setError('')
    setUploading(false)
    if (suggestions.length === 0) {
      const t = window.setTimeout(() => inputRef.current?.click(), 120)
      return () => window.clearTimeout(t)
    }
  }, [open, suggestions.length])

  if (!open) return null

  const busy = saving || uploading

  const processFile = async (file: File) => {
    setError('')
    const validation = validateImageFile(file)
    if (validation) {
      setError(validation)
      return
    }
    setUploading(true)
    try {
      const result = await uploadImageToCloudinary(file, FOLDER[kind])
      await onSelect(result.url)
      onClose()
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

  const thumbClass = kind === 'cover' ? 'np-photo-picker__thumb--cover' : 'np-photo-picker__thumb--avatar'

  return (
    <div
      className="np-photo-picker-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="np-photo-picker-title"
      onClick={onClose}
    >
      <div className="np-photo-picker" onClick={(e) => e.stopPropagation()}>
        <header className="np-photo-picker__head">
          <h2 id="np-photo-picker-title" className="np-photo-picker__title">
            {title}
          </h2>
          <button type="button" className="np-photo-picker__close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>

        {suggestions.length > 0 && (
          <section className="np-photo-picker__section">
            <p className="np-photo-picker__label">Your photos</p>
            <ul className="np-photo-picker__grid">
              {suggestions.map((url) => (
                <li key={url}>
                  <button
                    type="button"
                    className={clsx('np-photo-picker__thumb', thumbClass, currentUrl === url && 'is-current')}
                    disabled={busy}
                    onClick={() => void onSelect(url)}
                    title="Use this photo"
                  >
                    <IOSImage src={url} alt="" width={kind === 'cover' ? 240 : 120} />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="np-photo-picker__section">
          <p className="np-photo-picker__label">
            {suggestions.length > 0 ? 'Or upload new' : 'Upload a photo'}
          </p>
          <div
            role="button"
            tabIndex={0}
            className={clsx('np-photo-picker__drop', dragOver && 'is-dragover')}
            onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
          >
            <p className="np-photo-picker__drop-title">
              {uploading ? 'Uploading…' : 'Drop image or click to browse'}
            </p>
            <p className="np-photo-picker__drop-hint">JPG · PNG · WebP · max 10MB</p>
          </div>
        </section>

        {error && <p className="np-photo-picker__error">{error}</p>}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
          className="hidden"
          aria-label={`Upload ${kind === 'avatar' ? 'profile photo' : 'cover photo'}`}
          onChange={onFileChange}
        />
      </div>
    </div>
  )
}
