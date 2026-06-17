import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  createArticleTemplate,
  deleteArticleTemplate,
  listArticleTemplates,
} from '@/modules/editor/api/editor.api'
import type { ArticlePuckDocument } from '@/modules/editor/types/article-editor.types'
import { createEmptyPuckData } from '@/modules/editor/lib/article-puck-data'

export const articleTemplatesQueryKey = ['editor-article-templates'] as const

function normalizeTemplateDocument(raw: Record<string, unknown>): ArticlePuckDocument {
  if (
    typeof raw.version === 'number' &&
    raw.puck &&
    typeof raw.puck === 'object' &&
    raw.meta &&
    typeof raw.meta === 'object'
  ) {
    return raw as unknown as ArticlePuckDocument
  }
  return createEmptyPuckData()
}

export function useArticleTemplates() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: articleTemplatesQueryKey,
    queryFn: listArticleTemplates,
    staleTime: 60_000,
  })

  const saveMutation = useMutation({
    mutationFn: createArticleTemplate,
    onSuccess: () => {
      toast.success('Template saved')
      void queryClient.invalidateQueries({ queryKey: articleTemplatesQueryKey })
    },
    onError: () => toast.error('Failed to save template'),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteArticleTemplate,
    onSuccess: () => {
      toast.success('Template deleted')
      void queryClient.invalidateQueries({ queryKey: articleTemplatesQueryKey })
    },
    onError: () => toast.error('Failed to delete template'),
  })

  return {
    templates: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    saveTemplate: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
    deleteTemplate: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    normalizeTemplateDocument,
  }
}
