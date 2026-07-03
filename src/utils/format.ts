// utils/format.ts

import type { AgentStatus, TaskStatus } from '../types'

/** 智能体状态标签映射 */
const AGENT_STATUS_LABELS: Record<AgentStatus, string> = {
  idle: '空闲',
  assigned: '已分配',
  working: '工作中',
  completed: '已完成',
  failed: '失败',
  cancelled: '已取消',
}

/** 任务状态标签映射 */
const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  pending: '待处理',
  in_progress: '执行中',
  completed: '已完成',
  failed: '失败',
  cancelled: '已取消',
}

/** 格式化时间戳为 HH:mm:ss */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
}

/** 格式化智能体状态为中文标签 */
export function formatAgentStatus(status: AgentStatus): string {
  return AGENT_STATUS_LABELS[status]
}

/** 格式化任务状态为中文标签 */
export function formatTaskStatus(status: TaskStatus): string {
  return TASK_STATUS_LABELS[status]
}
