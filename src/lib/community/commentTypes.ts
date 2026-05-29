export interface PostComment {
  id: string
  postId: string
  userId: string
  body: string
  createdAt: string
  displayName: string
  handle: string
  avatarUrl?: string
}
