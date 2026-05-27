import { Link } from 'react-router-dom'
import type { SceneReleaseCard } from '@/lib/discovery/sceneService'
import { IOSImage } from '@/components/ui/IOSImage'

interface SceneReleaseRailProps {
  releases: SceneReleaseCard[]
}

export function SceneReleaseRail({ releases }: SceneReleaseRailProps) {
  if (releases.length === 0) {
    return (
      <div className="scene-rail-empty ios-card">
        <p className="font-display font-bold">No premieres tagged for this scene yet</p>
        <p className="text-sm text-muted mt-2">
          Artists: schedule a release with this city + genre in your dashboard.
        </p>
        <Link to="/artist/dashboard" className="text-mh-red text-sm mt-3 inline-block uppercase tracking-widest">
          Schedule premiere →
        </Link>
      </div>
    )
  }

  return (
    <ul className="scene-release-rail">
      {releases.map((r) => (
        <li key={r.slug}>
          <Link to={`/release/${r.slug}`} className="scene-release-card ios-card">
            {r.coverUrl ? (
              <IOSImage
                src={r.coverUrl}
                alt=""
                width={120}
                className="scene-release-card-art"
              />
            ) : (
              <div className="scene-release-card-art scene-release-card-art-fallback" aria-hidden>
                ◉
              </div>
            )}
            <div className="scene-release-card-body">
              <p className="scene-release-card-type">{r.releaseType}</p>
              <p className="font-display font-bold">{r.title}</p>
              <p className="text-xs text-muted mt-1">{r.artistName}</p>
              <p className="text-xs text-mh-red mt-2">
                {r.status === 'scheduled' ? 'Premiere scheduled' : 'Out now'} ·{' '}
                {new Date(r.liveAt).toLocaleDateString()}
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  )
}
