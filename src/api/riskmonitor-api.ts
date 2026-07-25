import { API_ENDPOINTS } from '@/api/endpoints'
import { httpClient } from '@/api/http-client'
import type {
  Agent,
  AgentRole,
  AgentStatus,
  Artifact,
  MemoryChangeType,
  MemoryItem,
  MemorySnapshot,
  Task,
  TaskStatus,
  TaskStep,
} from '@/types'

type BackendTaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
type BackendAgentStatus = AgentStatus | 'working'

interface CreateTaskResponse {
  task_id: string
  status: BackendTaskStatus
  created_at: number
}

interface BackendTaskStep {
  id: string
  title: string
  status: BackendTaskStatus
}

interface BackendArtifact {
  id?: string
  type?: Artifact['type']
  title: string
  content: string
}

interface BackendTaskResult {
  summary?: string
  artifacts?: BackendArtifact[]
}

interface BackendTaskError {
  code: string
  message: string
}

interface BackendTaskDetail {
  id: string
  title?: string
  description: string
  status: BackendTaskStatus
  steps?: BackendTaskStep[]
  result?: BackendTaskResult | null
  error?: BackendTaskError | null
  created_at: number
  updated_at: number
}

interface BackendAgentItem {
  id: string
  role?: AgentRole
  name: string
  status: BackendAgentStatus
  currentTaskId?: string
  capabilities?: string[]
  lastActiveAt?: number
}

interface BackendAgentList {
  items: BackendAgentItem[]
  updated_at?: number
}

interface BackendMemoryItem {
  id: string
  taskId?: string | null
  sessionId?: string | null
  agentId: string
  scope: 'shared' | 'private'
  kind: string
  memoryType: string
  changeType: MemoryChangeType
  summary: string
  details?: string[]
  tags?: string[]
  confidence?: number
  createdAt: number
}

interface BackendMemorySummary {
  sharedCount: number
  privateCount: number
  agentCount: number
}

interface BackendMemorySnapshot {
  task_id?: string
  session_id?: string
  items: BackendMemoryItem[]
  summary?: BackendMemorySummary
  updated_at?: number
}

export interface CreateTaskInput {
  description: string
}

export interface AgentsSnapshot {
  items: Agent[]
  updatedAt: number
}

function mapMemoryItem(item: BackendMemoryItem): MemoryItem {
  return {
    id: item.id,
    taskId: item.taskId ?? undefined,
    sessionId: item.sessionId ?? undefined,
    agentId: item.agentId,
    scope: item.scope,
    kind: item.kind,
    memoryType: item.memoryType,
    changeType: item.changeType,
    summary: item.summary,
    details: item.details ?? [],
    tags: item.tags ?? [],
    confidence: item.confidence ?? 0,
    createdAt: item.createdAt,
  }
}

function mapMemorySnapshot(response: BackendMemorySnapshot): MemorySnapshot {
  return {
    items: response.items.map(mapMemoryItem),
    summary: response.summary,
    updatedAt: response.updated_at ?? Date.now(),
    taskId: response.task_id ?? undefined,
    sessionId: response.session_id ?? undefined,
  }
}

function mapTaskStatus(status: BackendTaskStatus): TaskStatus {
  switch (status) {
    case 'running':
      return 'in_progress'
    case 'completed':
      return 'completed'
    case 'failed':
      return 'failed'
    case 'cancelled':
      return 'cancelled'
    case 'pending':
    default:
      return 'pending'
  }
}

function mapAgentRole(role?: AgentRole): AgentRole {
  return role ?? 'lead'
}

function mapAgentStatus(status: BackendAgentStatus): AgentStatus {
  if (status === 'working') {
    return 'working'
  }
  return status
}

function mapTaskSteps(task: BackendTaskDetail): TaskStep[] {
  return (task.steps ?? []).map((step) => ({
    id: step.id,
    title: step.title,
    status: mapTaskStatus(step.status),
  }))
}

function mapArtifacts(task: BackendTaskDetail): Artifact[] {
  return (task.result?.artifacts ?? []).map((artifact, index) => ({
    id: artifact.id ?? `${task.id}-artifact-${index + 1}`,
    taskId: task.id,
    type: artifact.type ?? 'document',
    title: artifact.title,
    content: artifact.content,
    version: 1,
    createdAt: task.updated_at,
    updatedAt: task.updated_at,
  }))
}

function buildTaskTitle(task: BackendTaskDetail): string {
  return task.title ?? (task.description.slice(0, 48) || '未命名任务')
}

export function createDraftTask(taskId: string, description: string, createdAt: number): Task {
  return {
    id: taskId,
    title: description.slice(0, 48) || '未命名任务',
    description,
    status: 'pending',
    priority: 'medium',
    dependencies: [],
    artifacts: [],
    subtasks: [],
    createdAt,
    updatedAt: createdAt,
    steps: [],
  }
}

export function mapTaskDetail(task: BackendTaskDetail): Task {
  const mappedStatus = mapTaskStatus(task.status)

  return {
    id: task.id,
    title: buildTaskTitle(task),
    description: task.description,
    status: mappedStatus,
    priority: 'medium',
    dependencies: [],
    artifacts: mapArtifacts(task),
    subtasks: [],
    createdAt: task.created_at,
    startedAt: mappedStatus === 'pending' ? undefined : task.created_at,
    completedAt: mappedStatus === 'completed' ? task.updated_at : undefined,
    updatedAt: task.updated_at,
    errorMessage: task.error?.message,
    resultSummary: task.result?.summary,
    steps: mapTaskSteps(task),
  }
}

function mapAgent(agent: BackendAgentItem, updatedAt: number): Agent {
  return {
    id: agent.id,
    role: mapAgentRole(agent.role),
    name: agent.name,
    status: mapAgentStatus(agent.status),
    currentTaskId: agent.currentTaskId,
    capabilities: agent.capabilities ?? [],
    createdAt: updatedAt,
    lastActiveAt: agent.lastActiveAt ?? updatedAt,
  }
}

export async function createTask(input: CreateTaskInput): Promise<CreateTaskResponse> {
  return httpClient.post<CreateTaskResponse>(API_ENDPOINTS.createTask, input)
}

export async function getTask(taskId: string): Promise<Task> {
  const response = await httpClient.get<BackendTaskDetail>(API_ENDPOINTS.getTask(taskId))
  return mapTaskDetail(response)
}

export async function getAgents(): Promise<AgentsSnapshot> {
  const response = await httpClient.get<BackendAgentList>(API_ENDPOINTS.getAgents)
  const updatedAt = response.updated_at ?? Date.now()

  return {
    items: response.items.map((item) => mapAgent(item, updatedAt)),
    updatedAt,
  }
}

export async function getMemory(limit = 20): Promise<MemorySnapshot> {
  const response = await httpClient.get<BackendMemorySnapshot>(`${API_ENDPOINTS.getMemory}?limit=${limit}`)
  return mapMemorySnapshot(response)
}

export async function getTaskMemory(taskId: string, limit = 30): Promise<MemorySnapshot> {
  const response = await httpClient.get<BackendMemorySnapshot>(`${API_ENDPOINTS.getTaskMemory(taskId)}?limit=${limit}`)
  return mapMemorySnapshot(response)
}
