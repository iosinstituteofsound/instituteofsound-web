import { z, type ZodType } from 'zod'
import { parseJsonBody, queryParam, type ApiRequest, type ApiResponse } from './http.js'

export function formatZodError(error: z.ZodError): string {
  const first = error.issues[0]
  if (!first) return 'Invalid request'
  const path = first.path.length ? `${first.path.join('.')}: ` : ''
  return `${path}${first.message}`
}

export function parseValidatedBody<T>(
  schema: ZodType<T>,
  body: unknown,
): { ok: true; data: T } | { ok: false; message: string } {
  const raw = parseJsonBody<unknown>(body)
  if (raw === null && body != null && body !== '') {
    return { ok: false, message: 'Invalid JSON body' }
  }
  const result = schema.safeParse(raw ?? {})
  if (!result.success) {
    return { ok: false, message: formatZodError(result.error) }
  }
  return { ok: true, data: result.data }
}

export function parseValidatedQuery<T>(
  schema: ZodType<T>,
  req: ApiRequest,
): { ok: true; data: T } | { ok: false; message: string } {
  const result = schema.safeParse(req.query ?? {})
  if (!result.success) {
    return { ok: false, message: formatZodError(result.error) }
  }
  return { ok: true, data: result.data }
}

export function sendValidationError(res: ApiResponse, message: string) {
  return res.status(400).json({ error: message })
}

/** Validate JSON body; responds 400 and returns null on failure. */
export function requireValidatedBody<T>(
  res: ApiResponse,
  schema: ZodType<T>,
  body: unknown,
): T | null {
  const parsed = parseValidatedBody(schema, body)
  if (!parsed.ok) {
    sendValidationError(res, parsed.message)
    return null
  }
  return parsed.data
}

/** Validate query string map; responds 400 and returns null on failure. */
export function requireValidatedQuery<T>(
  res: ApiResponse,
  schema: ZodType<T>,
  req: ApiRequest,
): T | null {
  const parsed = parseValidatedQuery(schema, req)
  if (!parsed.ok) {
    sendValidationError(res, parsed.message)
    return null
  }
  return parsed.data
}

export function requireQueryParam(
  res: ApiResponse,
  req: ApiRequest,
  key: string,
  schema: ZodType<string> = z.string().trim().min(1),
): string | null {
  const value = queryParam(req, key)
  const result = schema.safeParse(value)
  if (!result.success) {
    sendValidationError(res, `${key} required`)
    return null
  }
  return result.data
}
