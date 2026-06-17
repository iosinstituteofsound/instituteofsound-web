import { useRef } from 'react'
import { ImageIcon, Loader2, Upload } from 'lucide-react'
import { uploadMediaFile } from '@/modules/feed/api/media.api'
import { RichTextEditor } from '@/modules/editor/components/rich-text-editor'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { cn } from '@/shared/lib/cn'

interface PuckFieldProps<T> {
  value: T
  onChange: (value: T) => void
}

export function PuckRichTextField({
  value,
  onChange,
  placeholder,
  minHeight = '200px',
}: PuckFieldProps<string> & { placeholder?: string; minHeight?: string }) {
  return (
    <RichTextEditor
      value={value ?? ''}
      onChange={onChange}
      placeholder={placeholder}
      minHeight={minHeight}
    />
  )
}

export function PuckImageField({ value, onChange }: PuckFieldProps<string>) {
  const inputRef = useRef<HTMLInputElement>(null)
  const uploadingRef = useRef(false)

  const handleFile = async (file: File) => {
    if (uploadingRef.current) return
    uploadingRef.current = true
    try {
      const uploaded = await uploadMediaFile(file, file.name)
      onChange(uploaded.url)
    } finally {
      uploadingRef.current = false
    }
  }

  return (
    <div className="space-y-3">
      {value ? (
        <div className="overflow-hidden rounded-lg border border-border bg-muted/30">
          <img src={value} alt="" className="max-h-48 w-full object-cover" />
        </div>
      ) : (
        <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-border bg-muted/20">
          <ImageIcon className="h-8 w-8 text-muted-foreground" />
        </div>
      )}
      <div className="flex flex-wrap gap-2">
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
        <Button type="button" size="sm" variant="outline" onClick={() => inputRef.current?.click()}>
          <Upload className="mr-1.5 h-3.5 w-3.5" />
          Upload
        </Button>
      </div>
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Image URL</Label>
        <Input value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder="https://..." />
      </div>
    </div>
  )
}

export function PuckTextField({ value, onChange, placeholder }: PuckFieldProps<string> & { placeholder?: string }) {
  return <Input value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
}

export function PuckTextareaField({
  value,
  onChange,
  placeholder,
  maxLength,
}: PuckFieldProps<string> & { placeholder?: string; maxLength?: number }) {
  return (
    <div className="space-y-1">
      <textarea
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={3}
        className={cn(
          'flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-sm',
          'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        )}
      />
      {maxLength ? (
        <p className="text-right text-xs text-muted-foreground">
          {(value ?? '').length}/{maxLength}
        </p>
      ) : null}
    </div>
  )
}

export function PuckImageUploadButton({
  onUploaded,
  label = 'Replace image',
}: {
  onUploaded: (url: string) => void
  label?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const busyRef = useRef(false)

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0]
          if (!file || busyRef.current) return
          busyRef.current = true
          try {
            const uploaded = await uploadMediaFile(file, file.name)
            onUploaded(uploaded.url)
          } finally {
            busyRef.current = false
            e.target.value = ''
          }
        }}
      />
      <Button type="button" size="sm" variant="secondary" onClick={() => inputRef.current?.click()}>
        {busyRef.current ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
        {label}
      </Button>
    </>
  )
}
