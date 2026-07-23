import type { AgentRole, AgentStatus, TaskPriority, TaskStatus } from '@/types'

export function getAgentRoleLabel(role: AgentRole): string {
  const labels: Record<AgentRole, string> = {
    lead: 'Lead',
    researcher: 'Researcher',
    engineer: 'Engineer',
    qa: 'QA',
    reviewer: 'Reviewer',
    ui_operator: 'UI Operator',
  }

  return labels[role]
}

export function getStatusLabel(status: AgentStatus | TaskStatus): string {
  const labels: Record<AgentStatus | TaskStatus, string> = {
    idle: '空闲',
    assigned: '已分配',
    working: '进行中',
    completed: '已完成',
    failed: '失败',
    cancelled: '已取消',
    pending: '待处理',
    in_progress: '执行中',
  }

  return labels[status]
}

export function getPriorityLabel(priority: TaskPriority): string {
  const labels: Record<TaskPriority, string> = {
    low: '低',
    medium: '中',
    high: '高',
    critical: '紧急',
  }

  return labels[priority]
}
