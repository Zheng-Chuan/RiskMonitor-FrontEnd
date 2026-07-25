import type { Agent } from './agent'
import type { MemorySnapshot } from './memory'
import type { TaskGraphSnapshot } from './task'

export type WorkspaceStreamEventType = 'agent_snapshot' | 'memory_snapshot' | 'graph_snapshot' | 'heartbeat' | 'error'

export interface AgentSnapshotStreamEvent {
  type: 'agent_snapshot'
  updated_at: number
  data: {
    items: Agent[]
    updated_at: number
  }
}

export interface MemorySnapshotStreamEvent {
  type: 'memory_snapshot'
  updated_at: number
  data: MemorySnapshot & {
    task_id?: string
    session_id?: string
  }
}

export interface GraphSnapshotStreamEvent {
  type: 'graph_snapshot'
  updated_at: number
  data: TaskGraphSnapshot & {
    task_id?: string
    session_id?: string
    schema_version?: string
    updated_at?: number
  }
}

export interface HeartbeatStreamEvent {
  type: 'heartbeat'
  ts: number
}

export interface StreamErrorEvent {
  type: 'error'
  code: string
  message: string
}

export type WorkspaceStreamEvent =
  | AgentSnapshotStreamEvent
  | MemorySnapshotStreamEvent
  | GraphSnapshotStreamEvent
  | HeartbeatStreamEvent
  | StreamErrorEvent
