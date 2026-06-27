import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { listArtistSubmissions } from '@/modules/explore/api/explore.api'
import { ProfileTabEmpty } from '@/modules/profile/components/profile-tab-empty'
import { ListRow, PanelCard } from '@/shared/components/layout'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { PageLoader } from '@/shared/components/feedback/loader'

type ProfileArtistSubmissionsTabProps = {
  isOwnProfile: boolean
}

export function ProfileArtistSubmissionsTab({ isOwnProfile }: ProfileArtistSubmissionsTabProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['artist-submissions'],
    queryFn: listArtistSubmissions,
    enabled: isOwnProfile,
  })

  if (!isOwnProfile) {
    return <ProfileTabEmpty message="Submissions are only visible on the artist's own profile." />
  }

  if (isLoading) return <PageLoader />

  return (
    <PanelCard
      title="My Submissions"
      action={
        <Button asChild size="sm">
          <Link to="/artist/submissions/new">New Submission</Link>
        </Button>
      }
      contentClassName="space-y-3"
    >
      {(data ?? []).length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">No submissions yet.</p>
      ) : (
        (data ?? []).map((sub) => (
          <ListRow key={sub.id}>
            <div>
              <p className="font-semibold">{sub.trackTitle}</p>
              <p className="text-sm text-muted-foreground">
                {sub.projectName} · {sub.genre}
              </p>
              {sub.targets && sub.targets.length > 0 ? (
                <p className="text-sm text-muted-foreground">
                  Submitted to {sub.targets.map((t) => t.destinationTitle).join(', ')}
                </p>
              ) : null}
            </div>
            <Badge variant="outline">{sub.status}</Badge>
          </ListRow>
        ))
      )}
    </PanelCard>
  )
}
