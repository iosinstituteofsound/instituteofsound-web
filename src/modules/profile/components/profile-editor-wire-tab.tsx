import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getWirePicks } from '@/modules/explore/api/explore.api'
import { ProfileTabEmpty } from '@/modules/profile/components/profile-tab-empty'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { PageLoader } from '@/shared/components/feedback/loader'

type ProfileEditorWireTabProps = {
  isOwnProfile: boolean
}

export function ProfileEditorWireTab({ isOwnProfile }: ProfileEditorWireTabProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['wire-picks'],
    queryFn: getWirePicks,
    enabled: isOwnProfile,
  })

  if (!isOwnProfile) {
    return <ProfileTabEmpty message="Wire picks are only visible on the editor's own profile." />
  }

  if (isLoading) return <PageLoader />

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3 pb-3">
        <CardTitle className="text-base">Wire Picks</CardTitle>
        <Button asChild size="sm" variant="outline">
          <Link to="/editor/wire">Manage wire</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {(data ?? []).length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No wire picks yet.</p>
        ) : (
          (data ?? []).map((item, index) => (
            <div key={`${item.feedItemId ?? item.articleId ?? item.releaseId ?? index}`} className="rounded-lg border p-4">
              <p className="font-semibold">{item.label || 'Wire pick'}</p>
              <p className="text-sm text-muted-foreground">Order {item.sortOrder + 1}</p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
