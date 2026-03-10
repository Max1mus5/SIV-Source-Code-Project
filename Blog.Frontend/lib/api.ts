const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  const { token, headers, ...rest } = options

  const mergedHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  }

  // Auto-inject token from localStorage if not provided and we're in browser
  const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('siv_token') : null)
  
  if (authToken) {
    mergedHeaders['Authorization'] = `Bearer ${authToken}`
  }

  // Remove Content-Type for FormData so fetch can set the correct boundary
  if (rest.body instanceof FormData) {
    delete mergedHeaders['Content-Type']
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: mergedHeaders,
  })

  const contentType = res.headers.get('content-type') ?? ''
  const json = contentType.includes('application/json') ? await res.json() : null

  if (!res.ok) {
    const message =
      (json as { message?: string; error?: string })?.message ??
      (json as { message?: string; error?: string })?.error ??
      `HTTP ${res.status}`
    throw new ApiError(res.status, message, json)
  }

  return json as T
}
