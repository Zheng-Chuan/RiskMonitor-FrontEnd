// types/task.ts

import type { AgentRole } from './agent'

/** 任务状态 */
export type TaskStatus =
  | 'pending' // 等待分配
  | 'in_progress' // 执行中
  | 'completed' // 已完成
  | 'failed' // 失败
  | 'cancelled' // 已取消

/** 任务优先级 */
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical'

/** 产出物类型 */
export type ArtifactType =
  | 'code' // 代码文件
  | 'report' // 调研报告
  | 'test_result' // 测试结果
  | 'review' // 审查意见
  | 'screenshot' // 截图
  | 'diff' // 代码差异
  | 'document' // 文档

/** 产出物 */
export interface Artifact {
  id: string
  taskId: string
  type: ArtifactType
  title: string
  content: string
  version: number
  metadata?: Record<string, unknown>
  createdAt: number
  updatedAt: number
}

/** 任务步骤 */
export interface TaskStep {
  id: string
  title: string
  status: TaskStatus
}

/** TaskGraph 状态 */
export type TaskGraphStatus =
  | 'pending'
  | 'ready'
  | 'running'
  | 'completed'
  | 'failed'
  | 'blocked'
  | 'skipped'

/** TaskGraph 节点 */
export interface TaskGraphNode {
  id: string
  label: string
  kind: string
  status: TaskGraphStatus
  parentId?: string
  targetAgent?: string
  toolName?: string
  reason?: string
  instruction?: string
  condition?: string
  startedAt?: number
  finishedAt?: number
  durationMs?: number
  data: Record<string, unknown>
}

/** TaskGraph 边 */
export interface TaskGraphEdge {
  id: string
  source: string
  target: string
  status: TaskGraphStatus
  condition?: string
  data: Record<string, unknown>
}

/** TaskGraph 快照 */
export interface TaskGraphSnapshot {
  taskId: string
  sessionId?: string
  status: string
  schemaVersion: string
  nodes: TaskGraphNode[]
  edges: TaskGraphEdge[]
  summary?: {
    nodeCount: number
    edgeCount: number
    completedCount: number
    runningCount: number
    failedCount: number
    blockedCount: number
  }
  updatedAt: number
}

/** Task 任务 */
export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  assignedAgentId?: string
  assignedRole?: AgentRole
  dependencies: string[] // 依赖的任务 ID 列表
  artifacts: Artifact[] // 关联的产出物
  subtasks: string[] // 子任务 ID 列表
  createdAt: number
  startedAt?: number
  completedAt?: number
  updatedAt?: number
  errorMessage?: string
  resultSummary?: string
  steps?: TaskStep[]
  graph?: TaskGraphSnapshot
}
