import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deleteEditorArticle, listEditorArticles, publishEditorArticle } from '@/modules/explore/api/explore.api'
import { EditorDeskGrid } from '@/modules/editor/components/editor-desk-grid'
import { ProfileTabEmpty } from '@/modules/profile/components/profile-tab-empty'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { PageLoader } from '@/shared/components/feedback/loader'
import { toast } from '@/shared/components/ui/sonner'

type ProfileEditorDraftsTabProps = {
  isOwnProfile: boolean
}

export function ProfileEditorDraftsTab({ isOwnProfile }: ProfileEditorDraftsTabProps) {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['editor-articles', 'draft'],
    queryFn: () => listEditorArticles('draft'),
    enabled: isOwnProfile,
  })

  const publishMutation = useMutation({
    mutationFn: publishEditorArticle,
    onSuccess: () => {
      toast.success('Published')
      void queryClient.invalidateQueries({ queryKey: ['editor-articles'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteEditorArticle,
    onSuccess: () => {
      toast.success('Deleted')
      void queryClient.invalidateQueries({ queryKey: ['editor-articles'] })
    },
  })

  if (!isOwnProfile) {
    return <ProfileTabEmpty message="Drafts are only visible on the editor's own profile." />
  }

  if (isLoading) return <PageLoader />

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Drafts</CardTitle>
      </CardHeader>
      <CardContent>
        <EditorDeskGrid
          articles={data ?? []}
          variant="desk"
          onPublish={(id) => publishMutation.mutate(id)}
          onDelete={(id) => deleteMutation.mutate(id)}
          isPublishing={publishMutation.isPending}
          isDeleting={deleteMutation.isPending}
        />
      </CardContent>
    </Card>
  )
}
