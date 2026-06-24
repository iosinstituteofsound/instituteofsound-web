import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/app/stores/auth-store'
import { getArtistProfile } from '@/modules/music/api/music.api'

interface ReleaseHeroDescriptionProps {
  description?: string | null
  releaseArtistProfileId?: string
}

export function ReleaseHeroDescription({
  description,
  releaseArtistProfileId,
}: ReleaseHeroDescriptionProps) {
  const userId = useAuthStore((s) => s.userId)
  const { data: artistProfile } = useQuery({
    queryKey: ['artist-profile'],
    queryFn: getArtistProfile,
    enabled: Boolean(userId),
    retry: false,
    staleTime: 60_000,
  })

  const text = description?.trim()
  const isOwner =
    Boolean(releaseArtistProfileId) && artistProfile?.id === releaseArtistProfileId

  return (
    <div className="explore-release-hero__description">
      <p className="explore-release-hero__description-label ios-mh-kicker">Description:</p>
      {text ? (
        <p className="explore-release-hero__description-text">{text}</p>
      ) : (
        <p className="explore-release-hero__description-empty">
          {isOwner
            ? 'Add a description when editing this release — credits, story, or context for listeners.'
            : 'No description yet.'}
        </p>
      )}
    </div>
  )
}
