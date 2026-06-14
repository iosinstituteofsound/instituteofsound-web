export type ApiSuccessResponse<T> = {
  success: true
  message: string
  data: T
}

export type ApiErrorResponse = {
  success: false
  message: string
  errors: Array<{ field?: string; message: string }>
}

export type NormalizedApiError = {
  message: string
  status: number
  fieldErrors: Array<{ field?: string; message: string }>
}

export type Paginated<T> = {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export type LegacyAuthError = { error: string }

export type RefreshTokenResponse = {
  access_token: string
  refresh_token: string
  expires_in: number
}
