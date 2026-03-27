import { ApiError } from '@/lib/api-error'

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
  options?: RequestInit
): Promise<T> {
  const headers = new Headers(options?.headers)

  const hasBody = options?.body !== undefined && options?.body !== null
  if (hasBody && !(options?.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const res = await fetch(apiUrl(path), { ...options, headers })
  const json = (await res.json()) as ApiSuccess<T> | ApiErrorBody

  if (!res.ok || json.error) {
    const err = json as ApiErrorBody
    throw new ApiError(err.message ?? 'Request failed', err.error?.code, res.status)
  }

  return (json as ApiSuccess<T>).data
}
