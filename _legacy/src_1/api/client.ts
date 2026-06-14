const API_BASE = '/api'
const SIMULATED_DELAY = 280

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function fetchApi<T>(endpoint: string): Promise<T> {
  await delay(SIMULATED_DELAY)
  const res = await fetch(`${API_BASE}${endpoint}`)
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${endpoint}`)
  }
  return res.json() as Promise<T>
}
