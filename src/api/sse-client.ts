import { API_ENDPOINTS } from './endpoints'
import type {
  AgentSnapshotStreamEvent,
  GraphSnapshotStreamEvent,
  HeartbeatStreamEvent,
  MemorySnapshotStreamEvent,
  StreamErrorEvent,
} from '@/types'
import { MAX_RECONNECT, RECONNECT_BASE_DELAY, RECONNECT_MAX_DELAY } from '@/utils/constants'

export interface WorkspaceStreamHandlers {
  onOpen?: () => void
  onAgentSnapshot?: (event: AgentSnapshotStreamEvent) => void
  onMemorySnapshot?: (event: MemorySnapshotStreamEvent) => void
  onGraphSnapshot?: (event: GraphSnapshotStreamEvent) => void
  onHeartbeat?: (event: HeartbeatStreamEvent) => void
  onErrorEvent?: (event: StreamErrorEvent) => void
  onConnectionError?: () => void
}

interface StreamConnectOptions {
  taskId?: string | null
}

function buildStreamUrl(options?: StreamConnectOptions): string {
  const url = new URL(
    API_ENDPOINTS.stream,
    import.meta.env.VITE_API_BASE_URL || window.location.origin,
  )
  if (options?.taskId) {
    url.searchParams.set('task_id', options.taskId)
  }
  url.searchParams.set('agents', '1')
  url.searchParams.set('memory', '1')
  url.searchParams.set('graph', '1')
  return url.toString()
}

export class WorkspaceStreamClient {
  private eventSource: EventSource | null = null
  private reconnectAttempts = 0
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private reconnectToken = 0

  connect(handlers: WorkspaceStreamHandlers, options?: StreamConnectOptions): void {
    this.disconnect()
    const reconnectToken = ++this.reconnectToken
    const connectInternal = () => {
      const url = buildStreamUrl(options)
      this.eventSource = new EventSource(url)

      this.eventSource.onopen = () => {
        this.reconnectAttempts = 0
        handlers.onOpen?.()
      }

      this.eventSource.addEventListener('agent_snapshot', (event) => {
        handlers.onAgentSnapshot?.(JSON.parse((event as MessageEvent).data) as AgentSnapshotStreamEvent)
      })

      this.eventSource.addEventListener('memory_snapshot', (event) => {
        handlers.onMemorySnapshot?.(JSON.parse((event as MessageEvent).data) as MemorySnapshotStreamEvent)
      })

      this.eventSource.addEventListener('graph_snapshot', (event) => {
        handlers.onGraphSnapshot?.(JSON.parse((event as MessageEvent).data) as GraphSnapshotStreamEvent)
      })

      this.eventSource.addEventListener('heartbeat', (event) => {
        handlers.onHeartbeat?.(JSON.parse((event as MessageEvent).data) as HeartbeatStreamEvent)
      })

      this.eventSource.addEventListener('error', (event) => {
        try {
          handlers.onErrorEvent?.(JSON.parse((event as MessageEvent).data) as StreamErrorEvent)
        } catch {
          handlers.onConnectionError?.()
        }
      })

      this.eventSource.onerror = () => {
        this.eventSource?.close()
        this.eventSource = null
        handlers.onConnectionError?.()

        if (this.reconnectAttempts >= MAX_RECONNECT || reconnectToken !== this.reconnectToken) {
          return
        }

        this.reconnectAttempts += 1
        const delay = Math.min(RECONNECT_BASE_DELAY * 2 ** this.reconnectAttempts, RECONNECT_MAX_DELAY)
        this.reconnectTimer = setTimeout(() => {
          if (reconnectToken === this.reconnectToken) {
            connectInternal()
          }
        }, delay)
      }
    }

    connectInternal()
  }

  disconnect(): void {
    this.reconnectToken += 1
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    this.eventSource?.close()
    this.eventSource = null
    this.reconnectAttempts = 0
  }
}

export const workspaceStreamClient = new WorkspaceStreamClient()
