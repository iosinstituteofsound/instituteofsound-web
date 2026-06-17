import { Loader2, Upload, X } from 'lucide-react'
import { useRef, useState, useEffect } from 'react'
import type { Data } from '@measured/puck'
import { ArticleBackgroundColorPicker } from '@/modules/editor/components/article-background-color-picker'
import {
  canvasBackgroundToStyle,
  clearCanvasBackground,
  readCanvasBackground,
  resolveCanvasBackgroundColor,
  updateCanvasBackground,
} from '@/modules/editor/lib/canvas-background-utils'
import {
  hasCustomCanvasBackground,
  hasCustomCanvasBackgroundColor,
  type CanvasBackgroundFit,
} from '@/modules/editor/types/article-canvas-background.types'
import { uploadMediaFile } from '@/modules/feed/api/media.api'
import { Button } from '@/shared/components/ui/button'
import { Label } from '@/shared/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { cn } from '@/shared/lib/cn'

interface ArticleEditBackgroundModalProps {
  data: Data
  onChange: (data: Data) => void
  onClose: () => void
}

const FIT_OPTIONS: { value: CanvasBackgroundFit; label: string }[] = [
  { value: 'cover', label: 'Cover' },
  { value: 'contain', label: 'Contain' },
  { value: 'tile', label: 'Tile' },
]

export function ArticleEditBackgroundModal({
  data,
  onChange,
  onClose,
}: ArticleEditBackgroundModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const latestDataRef = useRef(data)
  const [uploading, setUploading] = useState(false)
  const background = readCanvasBackground(data)
  const hasCustom = hasCustomCanvasBackground(background)
  const hasCustomColor = hasCustomCanvasBackgroundColor(background)
  const previewStyle = canvasBackgroundToStyle(background)

  useEffect(() => {
    latestDataRef.current = data
  }, [data])

  const applyPatch = (patch: Parameters<typeof updateCanvasBackground>[1]) => {
    const next = updateCanvasBackground(latestDataRef.current, patch)
    latestDataRef.current = next
    onChange(next)
  }

  const handleFile = async (file: File) => {
    if (uploading) return
    setUploading(true)
    try {
      const uploaded = await uploadMediaFile(file, file.name)
      applyPatch({ imageUrl: uploaded.url })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="article-edit-background-modal article-edit-tool-panel">
      <div className="article-edit-tool-panel__header">
        <span className="article-edit-tool-panel__title">Background</span>
        <button type="button" className="article-edit-tool-panel__close" onClick={onClose} aria-label="Close">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="article-edit-tool-panel__body article-edit-background-modal__body">
        <div
          className={cn(
            'article-edit-background-modal__preview',
            !hasCustom && 'article-edit-background-modal__preview--theme',
          )}
          style={hasCustom ? previewStyle : undefined}
        >
          <span className="article-edit-background-modal__preview-label">
            {hasCustom ? 'Article background' : 'Theme default'}
          </span>
        </div>

        <div className="article-edit-background-modal__section">
          <Label className="article-edit-background-modal__label">Color</Label>
          <ArticleBackgroundColorPicker
            value={{
              colorToken: background.colorToken,
              customColor: background.customColor,
            }}
            onChange={(selection) =>
              applyPatch({
                colorToken: selection.colorToken,
                customColor: selection.customColor,
              })
            }
          />
          {hasCustomColor ? (
            <button
              type="button"
              className="article-edit-background-modal__remove-image"
              onClick={() => applyPatch({ colorToken: '', customColor: '' })}
            >
              Clear color (use theme default)
            </button>
          ) : null}
        </div>

        <div className="article-edit-background-modal__section">
          <Label className="article-edit-background-modal__label">Background image</Label>
          <button
            type="button"
            className="article-edit-background-modal__upload"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            <span>{uploading ? 'Uploading…' : background.imageUrl ? 'Replace image' : 'Upload image'}</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            aria-label="Upload background image"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void handleFile(file)
              e.target.value = ''
            }}
          />
          {background.imageUrl ? (
            <button
              type="button"
              className="article-edit-background-modal__remove-image"
              onClick={() => applyPatch({ imageUrl: '' })}
            >
              Remove image
            </button>
          ) : null}
        </div>

        {background.imageUrl ? (
          <div className="article-edit-background-modal__section">
            <Label className="article-edit-background-modal__label">Image fit</Label>
            <Select value={background.fit} onValueChange={(value) => applyPatch({ fit: value as CanvasBackgroundFit })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FIT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}

        <p className="article-edit-background-modal__hint">
          {hasCustom
            ? `Canvas color: ${resolveCanvasBackgroundColor(background) ?? 'theme default'}`
            : 'No custom background — the canvas uses your theme default.'}
        </p>

        {hasCustom ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => onChange(clearCanvasBackground(data))}
          >
            Reset everything to theme default
          </Button>
        ) : null}
      </div>
    </div>
  )
}
