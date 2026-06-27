import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { listEditorSubmissions } from '@/modules/explore/api/explore.api'
import { ProfileTabEmpty } from '@/modules/profile/components/profile-tab-empty'
import { ListRow, PanelCard } from '@/shared/components/layout'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { PageLoader } from '@/shared/components/feedback/loader'

type ProfileEditorSubmissionsTabProps = {
  isOwnProfile: boolean
}

export function ProfileEditorSubmissionsTab({ isOwnProfile }: ProfileEditorSubmissionsTabProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['editor-submissions'],
    queryFn: () => listEditorSubmissions(),
    enabled: isOwnProfile,
  })

  if (!isOwnProfile) {
    return <ProfileTabEmpty message="Submission review is only visible on the editor's own profile." />
  }

  if (isLoading) return <PageLoader />

  const pending = (data ?? []).filter((sub) => sub.status === 'pending' || sub.status === 'in_review')

  return (
    <PanelCard
      title="Track Submissions"
      action={
        <Button asChild size="sm" variant="outline">
          <Link to="/editor/submissions">Open review desk</Link>
        </Button>
      }
      contentClassName="space-y-3"
    >
      {pending.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">No pending submissions.</p>
      ) : (
        pending.map((sub) => (
          <ListRow key={sub.id}>
            <div>
              <p className="font-semibold">{sub.trackTitle}</p>
              <p className="text-sm text-muted-foreground">
                {sub.projectName} · {sub.genre}
              </p>
            </div>
            <Badge variant="outline">{sub.status}</Badge>
          </ListRow>
        ))
      )}
    </PanelCard>
  )
}
