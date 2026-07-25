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
  TaskGraphEdge,
  TaskGraphNode,
  TaskGraphSnapshot,
  TaskGraphStatus,
  TaskStatus,
  TaskStep,
} from '@/types'

type BackendTaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
type BackendAgentStatus = AgentStatus | 'working'
type BackendTaskGraphStatus = TaskGraphStatus

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

interface BackendTaskGraphNode {
  id: string
  label: string
  kind: string
  status: BackendTaskGraphStatus
  parentId?: string
  parent_id?: string
  targetAgent?: string
  target_agent?: string
  toolName?: string
  tool_name?: string
  reason?: string
  instruction?: string
  condition?: string
  startedAt?: number
  started_at?: number
  finishedAt?: number
  finished_at?: number
  durationMs?: number
  duration_ms?: number
  data?: Record<string, unknown>
}

interface BackendTaskGraphEdge {
  id: string
  source: string
  target: string
  status: BackendTaskGraphStatus
  condition?: string
  data?: Record<string, unknown>
}

interface BackendTaskGraphSummary {
  nodeCount: number
  edgeCount: number
  completedCount: number
  runningCount: number
  failedCount: number
  blockedCount: number
}

interface BackendTaskGraphSnapshot {
  task_id?: string
  session_id?: string
  status: string
  schema_version?: string
  nodes: BackendTaskGraphNode[]
  edges: BackendTaskGraphEdge[]
  summary?: BackendTaskGraphSummary
  updated_at?: number
}

interface BackendTaskDetail {
  id: string
  title?: string
  description: string
  status: BackendTaskStatus
  steps?: BackendTaskStep[]
  result?: BackendTaskResult | null
  error?: BackendTaskError | null
  graph?: BackendTaskGraphSnapshot | null
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
    id: artifact.id ?? task.id + '-artifact-' + String(index + 1),
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

function normalizeGraphStatus(status: string | undefined): TaskGraphStatus {
  switch (status) {
    case 'ready':
      return 'ready'
    case 'running':
      return 'running'
    case 'completed':
      return 'completed'
    case 'failed':
      return 'failed'
    case 'blocked':
      return 'blocked'
    case 'skipped':
      return 'skipped'
    case 'pending':
    default:
      return 'pending'
  }
}

function mapGraphNode(node: BackendTaskGraphNode): TaskGraphNode {
  return {
    id: node.id,
    label: node.label,
    kind: node.kind,
    status: normalizeGraphStatus(node.status),
    parentId: node.parentId ?? node.parent_id,
    targetAgent: node.targetAgent ?? node.target_agent,
    toolName: node.toolName ?? node.tool_name,
    reason: node.reason,
    instruction: node.instruction,
    condition: node.condition,
    startedAt: node.startedAt ?? node.started_at,
    finishedAt: node.finishedAt ?? node.finished_at,
    durationMs: node.durationMs ?? node.duration_ms,
    data: node.data ?? {},
  }
}

function mapGraphEdge(edge: BackendTaskGraphEdge): TaskGraphEdge {
  return {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    status: normalizeGraphStatus(edge.status),
    condition: edge.condition,
    data: edge.data ?? {},
  }
}

export function mapTaskGraphSnapshot(snapshot: BackendTaskGraphSnapshot): TaskGraphSnapshot {
  return {
    taskId: snapshot.task_id ?? '',
    sessionId: snapshot.session_id ?? undefined,
    status: snapshot.status,
    schemaVersion: snapshot.schema_version ?? 'task_graph.v1',
    nodes: (snapshot.nodes ?? []).map(mapGraphNode),
    edges: (snapshot.edges ?? []).map(mapGraphEdge),
    summary: snapshot.summary,
    updatedAt: snapshot.updated_at ?? Date.now(),
  }
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
    graph: task.graph ? mapTaskGraphSnapshot(task.graph) : undefined,
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

export async function getTaskGraph(taskId: string): Promise<TaskGraphSnapshot> {
  const response = await httpClient.get<BackendTaskGraphSnapshot>(API_ENDPOINTS.getTaskGraph(taskId))
  return mapTaskGraphSnapshot(response)
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
  const response = await httpClient.get<BackendMemorySnapshot>(API_ENDPOINTS.getMemory + '?limit=' + String(limit))
  return mapMemorySnapshot(response)
}

export async function getTaskMemory(taskId: string, limit = 30): Promise<MemorySnapshot> {
  const response = await httpClient.get<BackendMemorySnapshot>(API_ENDPOINTS.getTaskMemory(taskId) + '?limit=' + String(limit))
  return mapMemorySnapshot(response)
}
