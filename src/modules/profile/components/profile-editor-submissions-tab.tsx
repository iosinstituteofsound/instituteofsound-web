import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { listEditorSubmissions } from '@/modules/explore/api/explore.api'
import { ProfileTabEmpty } from '@/modules/profile/components/profile-tab-empty'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { PageLoader } from '@/shared/components/feedback/loader'

type ProfileEditorSubmissionsTabProps = {
  isOwnProfile: boolean
}

export function ProfileEditorSubmissionsTab({ isOwnProfile }: ProfileEditorSubmissionsTabProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['editor-submissions', 'all'],
    queryFn: () => listEditorSubmissions(),
    enabled: isOwnProfile,
  })

  if (!isOwnProfile) {
    return <ProfileTabEmpty message="Submission review is only visible on the editor's own profile." />
  }

  if (isLoading) return <PageLoader />

  const pending = (data ?? []).filter((sub) => sub.status === 'pending' || sub.status === 'in_review')

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3 pb-3">
        <CardTitle className="text-base">Track Submissions</CardTitle>
        <Button asChild size="sm" variant="outline">
          <Link to="/editor/submissions">Open review desk</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {pending.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No pending submissions.</p>
        ) : (
          pending.map((sub) => (
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
