// api/sse-client.ts

import type {
  AgentStatusMessage,
  ArtifactMessage,
  ErrorMessage,
  SSEMessage,
  TaskUpdateMessage,
  TokenStreamMessage,
} from '../types'
import { MAX_RECONNECT } from '../utils/constants'

/** SSE 事件处理器 */
export interface SSEHandlers {
  onAgentStatus?: (message: AgentStatusMessage) => void
  onTokenStream?: (message: TokenStreamMessage) => void
  onTaskUpdate?: (message: TaskUpdateMessage) => void
  onArtifact?: (message: ArtifactMessage) => void
  onError?: (message: ErrorMessage) => void
}

/** SSE 客户端封装 */
export class SSEClient {
  private eventSource: EventSource | null = null
  private reconnectAttempts = 0
  private readonly maxReconnect = MAX_RECONNECT
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null

  connect(url: string, handlers: SSEHandlers): void {
    this.disconnect()
    this.eventSource = new EventSource(url)

    this.eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data) as SSEMessage
      this.dispatch(data, handlers)
    }

    this.eventSource.onerror = () => this.reconnect(url, handlers)
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    this.eventSource?.close()
    this.eventSource = null
    this.reconnectAttempts = 0
  }

  private dispatch(message: SSEMessage, handlers: SSEHandlers): void {
    switch (message.type) {
      case 'agent_status':
        handlers.onAgentStatus?.(message as AgentStatusMessage)
        break
      case 'token_stream':
        handlers.onTokenStream?.(message as TokenStreamMessage)
        break
      case 'task_update':
        handlers.onTaskUpdate?.(message as TaskUpdateMessage)
        break
      case 'artifact':
        handlers.onArtifact?.(message as ArtifactMessage)
        break
      case 'error':
        handlers.onError?.(message as ErrorMessage)
        break
    }
  }

  private reconnect(url: string, handlers: SSEHandlers): void {
    this.eventSource?.close()
    this.eventSource = null

    if (this.reconnectAttempts >= this.maxReconnect) {
      return
    }

    this.reconnectAttempts++
    const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 30000)
    this.reconnectTimer = setTimeout(() => {
      this.connect(url, handlers)
    }, delay)
  }
}

/** 默认 SSE 客户端实例 */
export const sseClient = new SSEClient()
