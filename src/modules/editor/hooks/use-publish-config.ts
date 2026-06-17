import { useQuery } from '@tanstack/react-query'
import { getPublishConfig } from '@/modules/editor/api/editor.api'

export const publishConfigQueryKey = ['editor-publish-config'] as const

export function usePublishConfig() {
  return useQuery({
    queryKey: publishConfigQueryKey,
    queryFn: getPublishConfig,
    staleTime: 5 * 60_000,
  })
}
