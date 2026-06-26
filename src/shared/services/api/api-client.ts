import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { env } from '@/shared/config/env'
import type {
  ApiErrorResponse,
  LegacyAuthError,
  NormalizedApiError,
} from '@/shared/types/api.types'
import { ensureAccessToken, getRefreshPromise } from './ensure-access-token'

function normalizeError(error: AxiosError): NormalizedApiError {
  const status = error.response?.status ?? 500
  const data = error.response?.data

  if (data && typeof data === 'object') {
    if ('success' in data && (data as ApiErrorResponse).success === false) {
      const apiError = data as ApiErrorResponse
      return {
        message: apiError.message || 'Request failed',
        status,
        fieldErrors: apiError.errors ?? [],
      }
    }
    if ('error' in data) {
      return {
        message: (data as LegacyAuthError).error,
        status,
        fieldErrors: [],
      }
    }
  }

  return {
    message: error.message || 'Network error',
    status,
    fieldErrors: [],
  }
}

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl || undefined,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
})

apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await ensureAccessToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true
      const newToken = await getRefreshPromise()

      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`
        return apiClient(original)
      }

      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
        window.location.href = '/auth/login'
      }
    }

    return Promise.reject(normalizeError(error))
  },
)

export { normalizeError }
