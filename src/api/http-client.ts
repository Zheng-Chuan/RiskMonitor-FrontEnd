// api/http-client.ts

/** HTTP 错误 */
export class HTTPError extends Error {
  status: number
  body: string

  constructor(status: number, body: string) {
    super(`HTTP ${status}: ${body}`)
    this.name = 'HTTPError'
    this.status = status
    this.body = body
  }
}

/** HTTP 请求客户端 */
export class HTTPClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  async request<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseURL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers as Record<string, string> | undefined),
      },
    })

    if (!response.ok) {
      throw new HTTPError(response.status, await response.text())
    }

    return response.json() as Promise<T>
  }

  get<T>(path: string, options?: RequestInit): Promise<T> {
    return this.request<T>(path, { ...options, method: 'GET' })
  }

  post<T>(path: string, body: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    })
  }
}

/** 默认 HTTP 客户端实例 */
export const httpClient = new HTTPClient(
  import.meta.env.VITE_API_BASE_URL || '',
)
