import { API_BASE_URL } from './config'

const DEFAULT_TIMEOUT_MS = 12_000

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  token?: string | null
  timeoutMs?: number
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new ApiError(
        'Request timed out. Is medi-backend running on port 2000?',
        408,
      )
    }
    throw err
  } finally {
    clearTimeout(timeoutId)
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, token, headers, timeoutMs = DEFAULT_TIMEOUT_MS, ...rest } = options

  const res = await fetchWithTimeout(
    `${API_BASE_URL}${path}`,
    {
      ...rest,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    },
    timeoutMs,
  )

  if (!res.ok) {
    let detail: unknown
    try {
      detail = await res.json()
    } catch {
      detail = await res.text()
    }
    const message =
      typeof detail === 'object' && detail !== null && 'message' in detail
        ? String((detail as { message: string | string[] }).message)
        : `Request failed (${res.status})`
    throw new ApiError(
      Array.isArray(message) ? message.join(', ') : message,
      res.status,
      detail,
    )
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export async function checkApiHealth(): Promise<boolean> {
  try {
    const res = await fetchWithTimeout(
      `${API_BASE_URL}/health`,
      { method: 'GET', cache: 'no-store' },
      5_000,
    )
    if (!res.ok) return false
    const data = await res.json()
    return data?.status === 'ok'
  } catch {
    return false
  }
}
