import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { getWireCandidates, getWirePicks, saveWirePicks } from '@/modules/explore/api/explore.api'
import type { WirePickItem } from '@/modules/explore/types/explore.types'

interface UseWirePicksEditorOptions {
  enabled?: boolean
  onSaved?: () => void
}

export function useWirePicksEditor({ enabled = true, onSaved }: UseWirePicksEditorOptions = {}) {
  const queryClient = useQueryClient()
  const [items, setItems] = useState<WirePickItem[]>([])

  const picksQuery = useQuery({
    queryKey: ['wire-picks'],
    queryFn: getWirePicks,
    enabled,
  })

  const candidatesQuery = useQuery({
    queryKey: ['wire-candidates'],
    queryFn: getWireCandidates,
    enabled,
  })

  useEffect(() => {
    if (picksQuery.data) setItems(picksQuery.data)
  }, [picksQuery.data])

  const saveMutation = useMutation({
    mutationFn: () => saveWirePicks(items),
    onSuccess: async (saved) => {
      setItems(saved)
      await queryClient.invalidateQueries({ queryKey: ['wire-picks'] })
      toast.success('Wire picks saved')
      onSaved?.()
    },
  })

  return {
    items,
    setItems,
    candidates: candidatesQuery.data,
    isLoading: picksQuery.isLoading || candidatesQuery.isLoading,
    isSaving: saveMutation.isPending,
    save: () => saveMutation.mutate(),
    picksQuery,
    candidatesQuery,
  }
}
