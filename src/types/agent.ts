// types/agent.ts

/** 专家角色类型 */
export type AgentRole =
  | 'lead' // Lead Agent，统一调度
  | 'researcher' // 调研员
  | 'engineer' // 全栈工程师
  | 'qa' // QA 测试工程师
  | 'reviewer' // 代码审查员
  | 'ui_operator' // UI 操作者

/** 智能体运行状态 */
export type AgentStatus =
  | 'idle'
  | 'assigned'
  | 'working'
  | 'completed'
  | 'failed'
  | 'cancelled'

/** Agent 智能体 */
export interface Agent {
  id: string
  role: AgentRole
  name: string
  status: AgentStatus
  avatar?: string
  currentTaskId?: string
  capabilities: string[]
  createdAt: number
  lastActiveAt: number
}
