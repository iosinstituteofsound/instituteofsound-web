import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { listEditorArticles } from '@/modules/explore/api/explore.api'
import { ProfileTabEmpty } from '@/modules/profile/components/profile-tab-empty'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { PageLoader } from '@/shared/components/feedback/loader'

type ProfileEditorialTabProps = {
  isOwnProfile: boolean
}

export function ProfileEditorialTab({ isOwnProfile }: ProfileEditorialTabProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['editor-articles', 'published'],
    queryFn: () => listEditorArticles('published'),
    enabled: isOwnProfile,
  })

  if (!isOwnProfile) {
    return <ProfileTabEmpty message="Published editorial work is only visible on the editor's own profile." />
  }

  if (isLoading) return <PageLoader />

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3 pb-3">
        <CardTitle className="text-base">Published Editorial</CardTitle>
        <Button asChild size="sm" variant="outline">
          <Link to="/editor">Open desk</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {(data ?? []).length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No published articles yet.</p>
        ) : (
          (data ?? []).map((article) => (
            <div key={article.id} className="flex items-center justify-between gap-3 rounded-lg border p-4">
              <div className="min-w-0">
                <p className="truncate font-semibold">{article.title || 'Untitled'}</p>
                <p className="truncate text-sm text-muted-foreground">{article.excerpt || article.type}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge variant="outline">Published</Badge>
                {article.slug ? (
                  <Button asChild size="sm" variant="ghost">
                    <Link to={`/explore/articles/${article.slug}`}>View</Link>
                  </Button>
                ) : null}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
