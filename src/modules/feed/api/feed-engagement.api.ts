import { API_V1 } from '@/shared/config/env'
import { apiClient } from '@/shared/services/api/api-client'
import type { ApiSuccessResponse } from '@/shared/types/api.types'
import type {
  FeedCommentDto,
  FeedCommentEngagementSummary,
  FeedCommentReactionUserDto,
  FeedEngagementSummary,
  FeedItemDto,
  FeedReactionKind,
} from '@/modules/feed/types/feed.types'

export async function getFeedItem(id: string) {
  const { data } = await apiClient.get<ApiSuccessResponse<{ item: FeedItemDto }>>(
    `${API_V1}/feed/${id}`,
  )
  return data.data.item
}

export async function setFeedReaction(feedItemId: string, kind: FeedReactionKind) {
  const { data } = await apiClient.put<ApiSuccessResponse<{ engagement: FeedEngagementSummary }>>(
    `${API_V1}/feed/${feedItemId}/reaction`,
    { kind },
  )
  return data.data.engagement
}

export async function listFeedComments(feedItemId: string) {
  const { data } = await apiClient.get<ApiSuccessResponse<{ comments: FeedCommentDto[] }>>(
    `${API_V1}/feed/${feedItemId}/comments`,
  )
  return data.data.comments
}

export async function addFeedComment(
  feedItemId: string,
  input: { body?: string; gifUrl?: string; giphyId?: string; parentId?: string },
) {
  const { data } = await apiClient.post<ApiSuccessResponse<{ comment: FeedCommentDto }>>(
    `${API_V1}/feed/${feedItemId}/comments`,
    input,
  )
  return data.data.comment
}

export async function deleteFeedComment(feedItemId: string, commentId: string) {
  await apiClient.delete(`${API_V1}/feed/${feedItemId}/comments/${commentId}`)
}

export async function setFeedCommentReaction(
  feedItemId: string,
  commentId: string,
  kind: FeedReactionKind,
) {
  const { data } = await apiClient.put<
    ApiSuccessResponse<{ engagement: FeedCommentEngagementSummary }>
  >(`${API_V1}/feed/${feedItemId}/comments/${commentId}/reaction`, { kind })
  return data.data.engagement
}

export async function listFeedCommentReactions(feedItemId: string, commentId: string) {
  const { data } = await apiClient.get<
    ApiSuccessResponse<{ reactions: FeedCommentReactionUserDto[] }>
  >(`${API_V1}/feed/${feedItemId}/comments/${commentId}/reactions`)
  return data.data.reactions
}
