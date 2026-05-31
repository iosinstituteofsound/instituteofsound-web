import { useRef, useState } from 'react'
import clsx from 'clsx'
import { isCloudinaryConfigured } from '@/lib/cloudinary/config'
import {
  uploadPdfToCloudinary,
  validatePdfFile,
  type CloudinaryFolder,
} from '@/lib/cloudinary/upload'

interface PdfUploadProps {
  label: string
  folder: CloudinaryFolder
  value?: string
  onChange: (url: string) => void
  hint?: string
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function PdfUpload({ label, folder, value, onChange, hint }: PdfUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [lastSize, setLastSize] = useState<number | null>(null)

  const configured = isCloudinaryConfigured()

  const processFile = async (file: File) => {
    setError('')
    const validation = validatePdfFile(file)
    if (validation) {
      setError(validation)
      return
    }
    setUploading(true)
    try {
      const result = await uploadPdfToCloudinary(file, folder)
      onChange(result.url)
      setLastSize(result.bytes)
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
      <div className="border border-amber-500/40 bg-amber-500/5 p-4 text-xs text-amber-400">
        <p className="font-bold uppercase tracking-widest mb-1">Cloudinary not configured</p>
        <p>Add VITE_CLOUDINARY_CLOUD_NAME and server signing keys for PDF upload, or paste a link below.</p>
      </div>
    )
  }

  return (
    <div>
      <label className="ios-label">{label}</label>
      {hint && <p className="text-xs text-muted mb-2">{hint}</p>}

      {value ? (
        <div className="border border-border p-4 space-y-3 ios-card">
          <div className="flex items-start gap-3">
            <span
              className="shrink-0 w-12 h-14 flex items-center justify-center bg-mh-red/15 border border-mh-red/30 text-mh-red text-xs font-bold uppercase"
              aria-hidden
            >
              PDF
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">Press kit uploaded</p>
              <p className="text-[10px] text-muted-foreground truncate">{value}</p>
              {lastSize != null && (
                <p className="text-[10px] text-muted-foreground mt-0.5">{formatBytes(lastSize)}</p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="ios-btn ios-btn-secondary !py-2 !px-3"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              Replace PDF
            </button>
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="ios-btn ios-btn-secondary !py-2 !px-3"
            >
              Preview
            </a>
            <button
              type="button"
              className="ios-btn !py-2 !px-3 text-mh-red"
              onClick={() => {
                onChange('')
                setLastSize(null)
              }}
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click()
          }}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={clsx(
            'border border-dashed p-8 text-center cursor-pointer transition-colors',
            dragOver ? 'border-mh-red bg-mh-red/5' : 'border-border hover:border-mh-red/50'
          )}
        >
          <p className="text-sm font-medium uppercase tracking-widest">
            {uploading ? 'Uploading PDF…' : 'Drop EPK PDF or click to upload'}
          </p>
          <p className="text-xs text-muted mt-2">PDF only · max 15MB</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={onFileChange}
      />
      {error && <p className="text-mh-red text-xs mt-2">{error}</p>}
    </div>
  )
}
