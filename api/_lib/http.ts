export type ApiRequest = {
  method?: string
  headers?: Record<string, string | string[] | undefined>
  body?: unknown
  query?: Record<string, string | string[] | undefined>
}

export function queryParam(req: ApiRequest, key: string): string | undefined {
  const raw = req.query?.[key]
  if (typeof raw === 'string') return raw
  if (Array.isArray(raw)) return raw[0]
  return undefined
}

export type ApiResponse = {
  status: (code: number) => ApiResponse
  setHeader: (name: string, value: string) => void
  json: (body: unknown) => void
  end?: (body?: string) => void
}

export function methodNotAllowed(res: ApiResponse, allowed: string[]) {
  res.setHeader('Allow', allowed.join(', '))
  return res.status(405).json({ error: 'Method not allowed' })
}

export function parseJsonBody<T>(body: unknown): T | null {
  if (body == null || body === '') return null
  if (typeof body === 'object') return body as T
  if (typeof body === 'string') {
    try {
      return JSON.parse(body) as T
    } catch {
      return null
    }
  }
  return null
}
