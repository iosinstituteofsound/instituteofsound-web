import { useQuery } from '@tanstack/react-query'
import { Navigate, useParams } from 'react-router-dom'
import { getTrackReleaseRedirect } from '@/modules/music/api/music.api'
import { Loader } from '@/shared/components/feedback/loader'

export function TrackReleaseRedirectPage() {
  const { trackId = '' } = useParams()
  const { data, isLoading, isError } = useQuery({
    queryKey: ['track-release-redirect', trackId],
    queryFn: () => getTrackReleaseRedirect(trackId),
    enabled: Boolean(trackId),
    retry: false,
  })

  if (isLoading) return <Loader className="min-h-[40vh]" />
  if (isError || !data?.releaseId) return <Navigate to="/releases" replace />
  return <Navigate to={`/releases/${data.releaseId}`} replace />
}
