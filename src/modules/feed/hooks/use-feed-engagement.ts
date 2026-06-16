import { useMutation, useQuery, useQueryClient, type InfiniteData } from '@tanstack/react-query'
import * as engagementApi from '@/modules/feed/api/feed-engagement.api'
import { feedQueryKey } from '@/modules/feed/hooks/use-feed'
import {
  feedCommentsQueryKey,
  feedCommentReactionsQueryKey,
  feedItemQueryKey,
  patchFeedItemInCache,
} from '@/modules/feed/lib/feed-engagement'
import type {
  FeedCommentDto,
  FeedEngagementSummary,
  FeedItemDto,
  FeedListResponse,
  FeedReactionKind,
} from '@/modules/feed/types/feed.types'

export function useFeedItem(id: string, enabled = true) {
  return useQuery({
    queryKey: feedItemQueryKey(id),
    queryFn: () => engagementApi.getFeedItem(id),
    enabled: enabled && Boolean(id),
  })
}

export function useFeedComments(feedItemId: string, enabled = true) {
  return useQuery({
    queryKey: feedCommentsQueryKey(feedItemId),
    queryFn: () => engagementApi.listFeedComments(feedItemId),
    enabled: enabled && Boolean(feedItemId),
  })
}

export function useFeedCommentReactions(
  feedItemId: string,
  commentId: string,
  enabled = false,
) {
  return useQuery({
    queryKey: feedCommentReactionsQueryKey(feedItemId, commentId),
    queryFn: () => engagementApi.listFeedCommentReactions(feedItemId, commentId),
    enabled: enabled && Boolean(feedItemId) && Boolean(commentId),
  })
}

function updateEngagementInFeedCaches(
  queryClient: ReturnType<typeof useQueryClient>,
  feedItemId: string,
  engagement: FeedEngagementSummary,
) {
  queryClient.setQueriesData<InfiniteData<FeedListResponse>>(
    { queryKey: feedQueryKey },
    (old) =>
      patchFeedItemInCache(old, feedItemId, (item) => ({
        ...item,
        engagement,
      })),
  )

  queryClient.setQueryData(feedItemQueryKey(feedItemId), (old: FeedItemDto | undefined) =>
    old ? { ...old, engagement } : old,
  )
}

export function useSetFeedReaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ feedItemId, kind }: { feedItemId: string; kind: FeedReactionKind }) =>
      engagementApi.setFeedReaction(feedItemId, kind),
    onSuccess: (engagement, { feedItemId }) => {
      updateEngagementInFeedCaches(queryClient, feedItemId, engagement)
    },
  })
}

export function useSetFeedCommentReaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      feedItemId,
      commentId,
      kind,
    }: {
      feedItemId: string
      commentId: string
      kind: FeedReactionKind
    }) => engagementApi.setFeedCommentReaction(feedItemId, commentId, kind),
    onSuccess: (engagement, { feedItemId, commentId }) => {
      queryClient.setQueryData(feedCommentsQueryKey(feedItemId), (old: FeedCommentDto[] | undefined) =>
        old?.map((comment) =>
          comment.id === commentId ? { ...comment, engagement } : comment,
        ),
      )
      void queryClient.invalidateQueries({
        queryKey: feedCommentReactionsQueryKey(feedItemId, commentId),
      })
    },
  })
}

export function useAddFeedComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      feedItemId,
      body,
      gifUrl,
      giphyId,
      parentId,
    }: {
      feedItemId: string
      body?: string
      gifUrl?: string
      giphyId?: string
      parentId?: string
    }) => engagementApi.addFeedComment(feedItemId, { body, gifUrl, giphyId, parentId }),
    onSuccess: (comment, { feedItemId }) => {
      queryClient.setQueryData(feedCommentsQueryKey(feedItemId), (old: typeof comment[] | undefined) =>
        old ? [...old, comment] : [comment],
      )

      queryClient.setQueriesData<InfiniteData<FeedListResponse>>(
        { queryKey: feedQueryKey },
        (old) =>
          patchFeedItemInCache(old, feedItemId, (item) => {
            const engagement = item.engagement ?? {
              reactions: { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 },
              reactionTotal: 0,
              commentCount: 0,
              myReaction: null,
            }
            return {
              ...item,
              engagement: {
                ...engagement,
                commentCount: engagement.commentCount + 1,
              },
            }
          }),
      )

      queryClient.setQueryData(feedItemQueryKey(feedItemId), (old: FeedItemDto | undefined) => {
        if (!old?.engagement) return old
        return {
          ...old,
          engagement: {
            ...old.engagement,
            commentCount: old.engagement.commentCount + 1,
          },
        }
      })
    },
  })
}

export function useDeleteFeedComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      feedItemId,
      commentId,
    }: {
      feedItemId: string
      commentId: string
    }) => engagementApi.deleteFeedComment(feedItemId, commentId),
    onSuccess: (_result, { feedItemId }) => {
      void queryClient.invalidateQueries({ queryKey: feedCommentsQueryKey(feedItemId) })
      void queryClient.invalidateQueries({ queryKey: feedQueryKey })
      void queryClient.invalidateQueries({ queryKey: feedItemQueryKey(feedItemId) })
    },
  })
}
