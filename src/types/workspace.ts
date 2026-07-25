import type { Edge, Node } from '@xyflow/react'

import type { AgentRole, AgentStatus } from './agent'
import type { ArtifactType, TaskPriority, TaskStatus } from './task'

export interface WorkspaceTaskSummary {
  id: string
  title: string
  status: TaskStatus
  priority: TaskPriority
  phase: string
  ownerRole: AgentRole
  progress: number
  updatedAtLabel: string
}

export interface AgentPanelSummary {
  id: string
  role: AgentRole
  name: string
  status: AgentStatus
  summary: string
  activeTaskLabel: string
  metricLabel: string
}

export interface CanvasAgentNodeData extends Record<string, unknown> {
  role: AgentRole
  title: string
  status: AgentStatus
  subtitle: string
}

export interface AgentArtifactSummary {
  id: string
  title: string
  type: ArtifactType
  summary: string
}

export interface WorkspaceAgentDetail {
  id: string
  role: AgentRole
  name: string
  status: AgentStatus
  currentTask: string
  summary: string
  metrics: string[]
  outputTitle: string
  outputSummary: string
  artifacts: AgentArtifactSummary[]
}

export interface WorkspaceEvent {
  id: string
  time: string
  title: string
  description: string
  tone: 'info' | 'success' | 'warning'
}

export interface WorkspaceKpi {
  id: string
  label: string
  value: string
  hint: string
}

export interface SettingItem {
  id: string
  label: string
  value: string
  hint: string
}

export interface SettingSection {
  id: string
  title: string
  description: string
  items: SettingItem[]
}

export type WorkspaceNode = Node<CanvasAgentNodeData>
export type WorkspaceEdge = Edge
