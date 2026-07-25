export type MemoryScope = 'shared' | 'private'

export type MemoryChangeType = 'created' | 'updated' | 'compressed' | 'archived'

export interface MemoryItem {
  id: string
  taskId?: string
  sessionId?: string
  agentId: string
  scope: MemoryScope
  kind: string
  memoryType: string
  changeType: MemoryChangeType
  summary: string
  details: string[]
  tags: string[]
  confidence: number
  createdAt: number
}

export interface MemorySnapshotSummary {
  sharedCount: number
  privateCount: number
  agentCount: number
}

export interface MemorySnapshot {
  items: MemoryItem[]
  updatedAt: number
  summary?: MemorySnapshotSummary
  taskId?: string
  sessionId?: string
}
