import { Link } from 'react-router-dom'
import { slugifyArtistName } from '@/lib/artist-profile/slug'
import { findGenreBySlug } from '@/lib/discovery/sceneRegistry'

interface RelatedSceneLinkProps {
  sceneCity?: string
  sceneGenreSlug?: string
}

export function RelatedSceneLink({ sceneCity, sceneGenreSlug }: RelatedSceneLinkProps) {
  if (!sceneCity || !sceneGenreSlug) return null

  const citySlug = slugifyArtistName(sceneCity)
  const genreLabel = findGenreBySlug(sceneGenreSlug)?.label ?? sceneGenreSlug

  return (
    <Link to={`/scenes/${citySlug}/${sceneGenreSlug}`} className="release-scene-link ios-card">
      <p className="ios-kicker">Scene discovery</p>
      <p className="font-display font-bold mt-1">
        Explore {sceneCity} · {genreLabel}
      </p>
      <p className="text-sm text-muted mt-1">Premieres, tribe board, and spins in this scene →</p>
    </Link>
  )
}
