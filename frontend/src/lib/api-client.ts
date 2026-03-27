import { ApiError } from '@/lib/api-error'
import { supabase } from '@/lib/supabase'

export const UNAUTHORIZED_EVENT = 'scribix:unauthorized'

type ApiSuccess<T> = { data: T; error: null; message: string | null }
type ApiErrorBody = {
  data: null
  error: { code: string; details?: unknown }
  message: string
}

function apiBase(): string {
  return import.meta.env.VITE_API_BASE_URL ?? ''
}

export function apiUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`
  return `${apiBase()}/api/v1${p}`
}

export async function apiRequest<T>(
  path: string,
  options?: RequestInit & { skipAuth?: boolean }
): Promise<T> {
  const { skipAuth, ...init } = options ?? {}
  const headers = new Headers(init.headers)

  const hasBody = init.body !== undefined && init.body !== null
  if (hasBody && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  let bearer: string | null = null
  if (!skipAuth) {
    const { data: { session } } = await supabase.auth.getSession()
    bearer = session?.access_token ?? null
  }
  if (bearer) headers.set('Authorization', `Bearer ${bearer}`)

  const res = await fetch(apiUrl(path), { ...init, headers })
  const json = (await res.json()) as ApiSuccess<T> | ApiErrorBody

  if (!res.ok || json.error) {
    const err = json as ApiErrorBody
    if (res.status === 401 && bearer) {
      await supabase.auth.signOut()
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
    }
    throw new ApiError(err.message ?? 'Request failed', err.error?.code, res.status)
  }

  return (json as ApiSuccess<T>).data
}
