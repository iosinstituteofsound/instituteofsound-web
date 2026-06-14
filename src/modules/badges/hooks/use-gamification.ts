import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as gamificationApi from '@/modules/badges/api/gamification.api'

export function useGamificationCatalog() {
  return useQuery({
    queryKey: ['gamification', 'catalog'],
    queryFn: gamificationApi.getGamificationCatalog,
  })
}

export function useMyGamificationProgress() {
  return useQuery({
    queryKey: ['gamification', 'me'],
    queryFn: gamificationApi.getMyGamificationProgress,
  })
}

export function useThemes() {
  return useQuery({
    queryKey: ['gamification', 'themes'],
    queryFn: gamificationApi.listThemes,
  })
}

export function useCreateTheme() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: gamificationApi.createTheme,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gamification'] })
    },
  })
}

export function useUpdateTheme() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...input }: { id: string; slug?: string; name?: string; tokens?: gamificationApi.ThemeTokens; isDefault?: boolean }) =>
      gamificationApi.updateTheme(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gamification'] })
    },
  })
}

export function useDeleteTheme() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: gamificationApi.deleteTheme,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gamification'] })
    },
  })
}

export function useBadges() {
  return useQuery({
    queryKey: ['gamification', 'badges'],
    queryFn: gamificationApi.listBadges,
  })
}

export function useCreateBadge() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: gamificationApi.createBadge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gamification'] })
    },
  })
}

export function useUpdateBadge() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...input }: { id: string; slug?: string; name?: string; description?: string; themeId?: string }) =>
      gamificationApi.updateBadge(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gamification'] })
    },
  })
}

export function useDeleteBadge() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: gamificationApi.deleteBadge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gamification'] })
    },
  })
}
