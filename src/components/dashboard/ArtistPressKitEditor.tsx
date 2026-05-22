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
        Media & promoters ke liye PDF — bio, photos, tech rider, credits. Cloudinary par upload
        karo ya direct PDF link paste karo. Profile par download button dikhega.
      </p>
      <PdfUpload
        label="Upload EPK (PDF)"
        folder="ios/press-kits"
        value={pressKitUrl || undefined}
        onChange={onUrlChange}
        hint="Cloudinary preset ko raw/PDF allow karna hoga (unsigned upload)."
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
