export interface AwardDbInput {
  userId: string
  source: string
  sourceId: string
  amount: number
  genreId?: string | null
}
