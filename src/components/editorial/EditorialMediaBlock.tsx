import { IOSImage } from '@/components/ui/IOSImage'

interface EditorialMediaBlockProps {
  spotifyUrl?: string
  youtubeUrl?: string
  galleryImageUrls?: string[]
}

export function EditorialMediaBlock({
  spotifyUrl,
  youtubeUrl,
  galleryImageUrls = [],
}: EditorialMediaBlockProps) {
  const gallery = galleryImageUrls.filter(Boolean)
  const hasLinks = Boolean(spotifyUrl?.trim() || youtubeUrl?.trim())
  if (!hasLinks && gallery.length === 0) return null

  return (
    <div className="editorial-media-block mt-10 pt-8 border-t border-border space-y-8">
      {hasLinks && (
        <div className="flex flex-wrap gap-3">
          {spotifyUrl?.trim() && (
            <a
              href={spotifyUrl.trim()}
              target="_blank"
              rel="noreferrer noopener"
              className="editorial-media-link editorial-media-link-spotify"
            >
              Listen on Spotify
            </a>
          )}
          {youtubeUrl?.trim() && (
            <a
              href={youtubeUrl.trim()}
              target="_blank"
              rel="noreferrer noopener"
              className="editorial-media-link editorial-media-link-youtube"
            >
              Watch on YouTube
            </a>
          )}
        </div>
      )}
      {gallery.length > 0 && (
        <div>
          <p className="text-[10px] tracking-[0.25em] uppercase text-muted mb-4">Artist photos</p>
          <div className="editorial-media-gallery">
            {gallery.map((src, i) => (
              <figure key={`${src}-${i}`} className="editorial-media-gallery-item">
                <IOSImage
                  src={src}
                  alt=""
                  width={640}
                  height={480}
                  className="w-full h-full object-cover"
                />
              </figure>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
