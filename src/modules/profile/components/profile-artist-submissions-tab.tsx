import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { listArtistSubmissions } from '@/modules/explore/api/explore.api'
import { ProfileTabEmpty } from '@/modules/profile/components/profile-tab-empty'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3 pb-3">
        <CardTitle className="text-base">My Submissions</CardTitle>
        <Button asChild size="sm">
          <Link to="/artist/releases/new">Submit track</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {(data ?? []).length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No submissions yet.</p>
        ) : (
          (data ?? []).map((sub) => (
            <div key={sub.id} className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-semibold">{sub.trackTitle}</p>
                <p className="text-sm text-muted-foreground">
                  {sub.projectName} · {sub.genre}
                </p>
              </div>
              <Badge variant="outline">{sub.status}</Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
