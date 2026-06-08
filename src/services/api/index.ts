export { apiFetch, apiRootUrl, apiV1BaseUrl, apiUtilityUrl, tryAccessToken } from './client'
export type { ApiAuthMode, ApiFetchInit } from './client'
export { getMe } from './auth.service'

// Domain modules — re-export from legacy clients during migration
export * from '@/api/v1ArtistStudioClient'
export * from '@/api/v1FandomClient'
export * from '@/api/v1MediaClient'
export * from '@/api/v1Phase4Client'
export * from '@/api/v1Phase5Client'
