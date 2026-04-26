import { getToken, clearAuth } from './auth'

export const API_BASE = 'https://wally-api.mywally-app.com'

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

type FetchOptions = RequestInit & {
  auth?:    boolean  // default true — inject Bearer token
  timeout?: number   // ms, default 30 000
}

export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { auth = true, timeout = 30_000, ...init } = options

  const headers = new Headers(init.headers as HeadersInit)
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json')

  if (auth) {
    const token = getToken()
    if (token) headers.set('Authorization', `Bearer ${token}`)
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)

  try {
    const res = await fetch(`${API_BASE}${path}`, { ...init, headers, signal: controller.signal })

    if (res.status === 401) {
      clearAuth()
      window.location.href = '/login'
      throw new ApiError(401, 'Session expired')
    }

    if (res.status === 404) throw new ApiError(404, 'Not found')

    if (!res.ok) {
      let msg = res.statusText
      try {
        const errJson = await res.json() as { message?: string | string[] }
        const raw = errJson.message
        msg = Array.isArray(raw) ? raw.join(', ') : (raw ?? res.statusText)
      } catch {
        msg = await res.text().catch(() => res.statusText)
      }
      throw new ApiError(res.status, msg)
    }

    return res.json() as Promise<T>
  } finally {
    clearTimeout(timer)
  }
}
