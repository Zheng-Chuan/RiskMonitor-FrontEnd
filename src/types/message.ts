// types/message.ts

import type { AgentRole, AgentStatus } from './agent'
import type { ArtifactType, TaskStatus } from './task'

/** SSE 消息类型 */
export type SSEMessageType =
  | 'agent_status' // 智能体状态变更
  | 'token_stream' // 流式 token 输出
  | 'task_update' // 任务状态更新
  | 'artifact' // 产出物通知
  | 'error' // 错误通知

/** 对话消息来源 */
export type MessageSource = 'user' | 'agent' | 'system'

/** SSE 消息基础接口 */
export interface SSEMessage {
  type: SSEMessageType
  timestamp: number
  agentId?: string
  taskId?: string
  payload: unknown
}

/** 智能体状态消息 */
export interface AgentStatusMessage extends SSEMessage {
  type: 'agent_status'
  payload: {
    agentId: string
    role: AgentRole
    status: AgentStatus
    currentTaskId?: string
  }
}

/** 流式 Token 消息 */
export interface TokenStreamMessage extends SSEMessage {
  type: 'token_stream'
  payload: {
    messageId: string
    token: string
    sequence: number
  }
}

/** 任务更新消息 */
export interface TaskUpdateMessage extends SSEMessage {
  type: 'task_update'
  payload: {
    taskId: string
    status: TaskStatus
    progress?: number
    result?: string
  }
}

/** 产出物消息 */
export interface ArtifactMessage extends SSEMessage {
  type: 'artifact'
  payload: {
    artifactId: string
    taskId: string
    artifactType: ArtifactType
    content: string
    metadata?: Record<string, unknown>
  }
}

/** 错误消息 */
export interface ErrorMessage extends SSEMessage {
  type: 'error'
  payload: {
    code: string
    message: string
    retryable: boolean
  }
}

/** 对话消息 */
export interface Message {
  id: string
  source: MessageSource
  agentRole?: AgentRole // 来源智能体角色（agent 消息时有值）
  content: string
  isStreaming: boolean // 是否正在流式传输
  timestamp: number
  metadata?: {
    taskId?: string
    artifactId?: string
    tokens?: number // token 数量
  }
}
