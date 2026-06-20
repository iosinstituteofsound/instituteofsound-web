import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  createEditorEvent,
  deleteEditorEvent,
  listEditorEvents,
  updateEditorEvent,
} from '@/modules/explore/api/explore.api'
import type { EventDto } from '@/modules/explore/types/explore.types'
import { useEditorEventsDesk } from '@/shared/components/editor-events/hooks/use-editor-events-desk'
import { draftToCreatePayload, draftToUpdatePayload } from '@/shared/components/editor-events/lib/event-desk-utils'
import type { EventScheduleFilter } from '@/shared/components/editor-events/types'

interface UseEditorEventsEditorOptions {
  enabled?: boolean
  onSaved?: (event: EventDto) => void
}

export function useEditorEventsEditor({ enabled = true, onSaved }: UseEditorEventsEditorOptions = {}) {
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState<EventScheduleFilter>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const eventsQuery = useQuery({
    queryKey: ['editor-events'],
    queryFn: listEditorEvents,
    enabled,
  })

  const events = eventsQuery.data ?? []

  const desk = useEditorEventsDesk({
    events,
    filter,
    selectedId,
    isCreating,
    onSelect: (id) => {
      setIsCreating(false)
      setSelectedId(id)
    },
  })

  const saveMutation = useMutation({
    mutationFn: async ({ creating }: { creating: boolean }) => {
      if (creating) {
        return createEditorEvent(draftToCreatePayload(desk.draft))
      }
      if (!selectedId) throw new Error('No event selected')
      return updateEditorEvent(selectedId, draftToUpdatePayload(desk.draft))
    },
    onSuccess: async (event, { creating }) => {
      await queryClient.invalidateQueries({ queryKey: ['editor-events'] })
      setIsCreating(false)
      setSelectedId(event.id)
      toast.success(creating ? 'Event scheduled' : 'Event updated')
      onSaved?.(event)
    },
    onError: () => {
      toast.error('Could not save event')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!selectedId) throw new Error('No event selected')
      await deleteEditorEvent(selectedId)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['editor-events'] })
      setSelectedId(null)
      setIsCreating(false)
      toast.success('Event deleted')
    },
    onError: () => {
      toast.error('Could not delete event')
    },
  })

  const startCreate = () => {
    setSelectedId(null)
    setIsCreating(true)
  }

  return {
    filter,
    setFilter,
    selectedId,
    setSelectedId,
    isCreating,
    startCreate,
    events,
    isLoading: eventsQuery.isLoading,
    isSaving: saveMutation.isPending,
    isDeleting: deleteMutation.isPending,
    save: () => saveMutation.mutate({ creating: isCreating }),
    remove: () => deleteMutation.mutate(),
    ...desk,
  }
}
