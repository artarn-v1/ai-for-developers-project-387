const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function extractErrorMessage(res: Response): Promise<string> {
  try {
    const data = await res.clone().json()
    if (data && typeof data === 'object') {
      const message = (data as { message?: unknown; error?: unknown }).message
        ?? (data as { error?: unknown }).error
      if (typeof message === 'string' && message.length > 0) return message
    }
  } catch {
    // body was not JSON; fall back to status text
  }
  return `API error: ${res.status} ${res.statusText}`
}

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!res.ok) {
    throw new ApiError(res.status, await extractErrorMessage(res))
  }

  if (res.status === 204) return undefined as T
  return res.json()
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) =>
    request<T>(path, { method: 'DELETE' }),
}
