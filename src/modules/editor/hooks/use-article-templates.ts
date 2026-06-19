import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  createArticleTemplate,
  deleteArticleTemplate,
  listArticleTemplates,
} from '@/modules/editor/api/editor.api'
import { prepareTemplateForWorkspace } from '@/modules/editor/lib/apply-template-to-workspace'
import { enrichTemplatePuckForWorkspace } from '@/modules/editor/lib/enrich-template-workspace'
import {
  getSystemTemplateDocument,
  shouldUseWebTemplateFallback,
} from '@/modules/editor/lib/system-article-templates'
import type { ArticlePuckDocument } from '@/modules/editor/types/article-editor.types'
import type { ArticleTemplateDto } from '@/modules/editor/types/article-template.types'
import type { Data } from '@measured/puck'

export const articleTemplatesQueryKey = ['editor-article-templates'] as const

function resolvePuck(raw: Record<string, unknown>): Data | null {
  const puck = raw.puck
  if (!puck || typeof puck !== 'object') return null
  const candidate = puck as Data
  if (!Array.isArray(candidate.content)) return null
  return candidate
}

export function prepareSelectedTemplate(template: ArticleTemplateDto): ArticlePuckDocument {
  let raw = template.puckDocument
  if (template.source === 'system') {
    const fallback = getSystemTemplateDocument(template.id)
    if (fallback && shouldUseWebTemplateFallback(raw, template.id)) {
      raw = fallback
    }
  }

  const puck = resolvePuck(raw)
  if (!puck) return prepareTemplateForWorkspace(raw, template.id)

  const enriched = enrichTemplatePuckForWorkspace(puck, template.id, template.category)
  return prepareTemplateForWorkspace({ ...raw, puck: enriched }, template.id)
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
    prepareSelectedTemplate,
  }
}
