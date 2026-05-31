import { PdfUpload } from '@/components/ui/PdfUpload'
import { Input, FieldLabel } from '@/components/ui/Input'
import { DEFAULT_PRESS_KIT_LABEL } from '@/lib/artist-profile/types'

interface ArtistPressKitEditorProps {
  pressKitUrl: string
  pressKitLabel: string
  onUrlChange: (url: string) => void
  onLabelChange: (label: string) => void
}

export function ArtistPressKitEditor({
  pressKitUrl,
  pressKitLabel,
  onUrlChange,
  onLabelChange,
}: ArtistPressKitEditorProps) {
  return (
    <section className="ios-panel space-y-4">
      <p className="ios-kicker">Press kit / EPK</p>
      <p className="text-xs text-muted-foreground">
        PDF for media and promoters — bio, photos, tech rider, credits. Upload via Cloudinary or
        paste a direct PDF URL. A download button appears on your public profile.
      </p>
      <PdfUpload
        label="Upload EPK (PDF)"
        folder="ios/press-kits"
        value={pressKitUrl || undefined}
        onChange={onUrlChange}
        hint="PDF uploads use signed server signatures (ios/press-kits). Preset must allow raw/PDF on Cloudinary."
      />
      <div>
        <FieldLabel>Or paste PDF URL</FieldLabel>
        <Input
          type="url"
          value={pressKitUrl}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder="https://…/press-kit.pdf"
        />
      </div>
      <div>
        <FieldLabel>Download button label</FieldLabel>
        <Input
          value={pressKitLabel}
          onChange={(e) => onLabelChange(e.target.value)}
          placeholder={DEFAULT_PRESS_KIT_LABEL}
        />
      </div>
    </section>
  )
}
