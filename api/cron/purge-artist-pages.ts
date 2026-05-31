import { getSupabaseAdmin, isSupabaseServerConfigured } from '../_lib/supabaseServer.js'
import { env } from '../_lib/env.js'

type CronRequest = {
  method?: string
  headers?: { authorization?: string }
}

type CronResponse = {
  status: (code: number) => CronResponse
  json: (body: unknown) => void
}

function unauthorized(res: CronResponse): void {
  res.status(401).json({ error: 'Unauthorized' })
}

export default async function handler(req: CronRequest, res: CronResponse): Promise<void> {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const secret = env('CRON_SECRET')
  if (secret) {
    if (req.headers?.authorization !== `Bearer ${secret}`) {
      unauthorized(res)
      return
    }
  } else if (process.env.NODE_ENV === 'production' || process.env.VERCEL === '1') {
    res.status(503).json({ error: 'CRON_SECRET is not configured' })
    return
  }

  if (!isSupabaseServerConfigured()) {
    res.status(503).json({ error: 'Supabase is not configured on the server' })
    return
  }

  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase.rpc('purge_expired_artist_profiles')
    if (error) {
      res.status(500).json({ error: error.message })
      return
    }
    res.status(200).json({ ok: true, purged: data ?? 0 })
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Purge failed',
    })
  }
}
