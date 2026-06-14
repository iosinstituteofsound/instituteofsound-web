import { ImageUpload } from '@/components/ui/ImageUpload'
import type { CloudinaryFolder } from '@/lib/cloudinary/upload'

const MAX_GALLERY = 8

interface EditorialGalleryUploadProps {
  folder: CloudinaryFolder
  urls: string[]
  onChange: (urls: string[]) => void
}

export function EditorialGalleryUpload({ folder, urls, onChange }: EditorialGalleryUploadProps) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-muted leading-relaxed">
        Extra artist or live photos for the article (up to {MAX_GALLERY}). Shown in a gallery on the
        published page.
      </p>
      {urls.map((url, index) => (
        <div key={`${url}-${index}`}>
          <ImageUpload
            label={`Artist photo ${index + 1}`}
            folder={folder}
            value={url}
            onChange={(next) => {
              const copy = [...urls]
              copy[index] = next
              onChange(copy.filter(Boolean))
            }}
            hint="Band, live, or promo shot — Cloudinary CDN."
          />
          <button
            type="button"
            className="mt-2 text-[10px] tracking-widest uppercase text-mh-red hover:underline"
            onClick={() => onChange(urls.filter((_, i) => i !== index))}
          >
            Remove photo
          </button>
        </div>
      ))}
      {urls.length < MAX_GALLERY && (
        <ImageUpload
          label={urls.length === 0 ? 'Artist photos' : 'Add another photo'}
          folder={folder}
          value=""
          onChange={(url) => {
            if (url) onChange([...urls, url])
          }}
          hint="Optional — upload one at a time."
        />
      )}
    </div>
  )
}
