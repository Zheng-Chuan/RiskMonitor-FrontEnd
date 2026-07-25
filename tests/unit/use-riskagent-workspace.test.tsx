import { act, renderHook, waitFor } from '@testing-library/react'

import { useRiskAgentWorkspace } from '@/hooks/use-riskagent-workspace'
import { useAgentStore } from '@/store/agent-store'
import { useTaskStore } from '@/store/task-store'
import { POLLING_INTERVAL } from '@/utils/constants'

import { getAgents, getMemory, getTaskGraph, getTaskMemory } from '@/api/riskagent-api'

vi.mock('@/api/riskagent-api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/riskagent-api')>()
  return {
    ...actual,
    createTask: vi.fn(),
    getAgents: vi.fn(),
    getMemory: vi.fn(),
    getTask: vi.fn(),
    getTaskGraph: vi.fn(),
    getTaskMemory: vi.fn(),
  }
})

class FakeEventSource {
  static instances: FakeEventSource[] = []

  readonly url: string
  onopen: ((event: Event) => void) | null = null
  onerror: ((event: Event) => void) | null = null
  private readonly listeners = new Map<string, Set<(event: MessageEvent) => void>>()

  constructor(url: string) {
    this.url = url
    FakeEventSource.instances.push(this)
  }

  addEventListener(type: string, listener: (event: MessageEvent) => void): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set())
    }
    this.listeners.get(type)?.add(listener)
  }

  close(): void {
    return
  }

  emitOpen(): void {
    this.onopen?.(new Event('open'))
  }

  emit(type: string, payload: unknown): void {
    const event = new MessageEvent(type, { data: JSON.stringify(payload) })
    this.listeners.get(type)?.forEach((listener) => listener(event))
  }

  emitConnectionError(): void {
    this.onerror?.(new Event('error'))
  }
}

function resetStores() {
  useAgentStore.setState({
    agents: {},
    activeAgentIds: [],
    leadAgentId: null,
  })
  useTaskStore.setState({
    tasks: {},
    taskOrder: [],
    activeTaskId: null,
    filter: 'all',
  })
}

describe('useRiskAgentWorkspace realtime sync', () => {
  const originalEventSource = globalThis.EventSource

  beforeEach(() => {
    FakeEventSource.instances = []
    resetStores()
    vi.clearAllMocks()
    globalThis.EventSource = FakeEventSource as unknown as typeof EventSource

    vi.mocked(getAgents).mockResolvedValue({
      items: [],
      updatedAt: 1_724_800_000_000,
    })
    vi.mocked(getMemory).mockResolvedValue({
      items: [],
      summary: {
        sharedCount: 0,
        privateCount: 0,
        agentCount: 0,
      },
      updatedAt: 1_724_800_000_000,
    })
    vi.mocked(getTaskMemory).mockResolvedValue({
      items: [],
      summary: {
        sharedCount: 0,
        privateCount: 0,
        agentCount: 0,
      },
      updatedAt: 1_724_800_000_000,
    })
    vi.mocked(getTaskGraph).mockResolvedValue({
      taskId: 'task_1',
      sessionId: 'session_1',
      status: 'running',
      schemaVersion: 'task_graph.v1',
      nodes: [],
      edges: [],
      updatedAt: 1_724_800_000_000,
    })
  })

  afterEach(() => {
    globalThis.EventSource = originalEventSource
    vi.useRealTimers()
  })

  it('consumes agent and memory snapshots from SSE', async () => {
    const { result, unmount } = renderHook(() => useRiskAgentWorkspace())

    await waitFor(() => {
      expect(getAgents).toHaveBeenCalledTimes(1)
      expect(getMemory).toHaveBeenCalledTimes(1)
      expect(FakeEventSource.instances).toHaveLength(1)
    })

    act(() => {
      FakeEventSource.instances[0].emitOpen()
      FakeEventSource.instances[0].emit('agent_snapshot', {
        type: 'agent_snapshot',
        updated_at: 1_724_800_000_100,
        data: {
          items: [
            {
              id: 'system_engineer',
              role: 'engineer',
              name: 'System Engineer',
              status: 'working',
              capabilities: ['analyze', 'execute'],
              createdAt: 1_724_800_000_000,
              lastActiveAt: 1_724_800_000_100,
              currentTaskId: 'task_1',
            },
          ],
          updated_at: 1_724_800_000_100,
        },
      })
      FakeEventSource.instances[0].emit('memory_snapshot', {
        type: 'memory_snapshot',
        updated_at: 1_724_800_000_200,
        data: {
          items: [
            {
              id: 'mem_1',
              taskId: 'task_1',
              sessionId: 'session_1',
              agentId: 'system_engineer',
              scope: 'shared',
              kind: 'working_memory',
              memoryType: 'episodic',
              changeType: 'updated',
              summary: '已写入共享记忆',
              details: ['来源 task_graph_execution'],
              tags: ['delegate'],
              confidence: 1,
              createdAt: 1_724_800_000_200,
            },
          ],
          summary: {
            sharedCount: 1,
            privateCount: 0,
            agentCount: 1,
          },
          updatedAt: 1_724_800_000_200,
        },
      })
    })

    await waitFor(() => {
      expect(result.current.realtimeSyncMode).toBe('live')
      expect(result.current.orderedAgents[0]?.id).toBe('system_engineer')
      expect(result.current.memoryItems[0]?.id).toBe('mem_1')
      expect(result.current.memorySummary?.sharedCount).toBe(1)
    })

    unmount()
  })

  it('consumes graph snapshots from SSE when active task exists', async () => {
    useTaskStore.setState({
      tasks: {
        task_1: {
          id: 'task_1',
          title: '风险任务',
          description: '检查风险暴露',
          status: 'in_progress',
          priority: 'medium',
          dependencies: [],
          artifacts: [],
          subtasks: [],
          createdAt: 1_724_800_000_000,
          updatedAt: 1_724_800_000_000,
          steps: [],
        },
      },
      taskOrder: ['task_1'],
      activeTaskId: 'task_1',
      filter: 'all',
    })

    const { result, unmount } = renderHook(() => useRiskAgentWorkspace())

    await waitFor(() => {
      expect(getTaskGraph).toHaveBeenCalledWith('task_1')
      expect(FakeEventSource.instances).toHaveLength(1)
    })

    act(() => {
      FakeEventSource.instances[0].emitOpen()
      FakeEventSource.instances[0].emit('graph_snapshot', {
        type: 'graph_snapshot',
        updated_at: 1_724_800_000_300,
        data: {
          task_id: 'task_1',
          session_id: 'session_1',
          status: 'running',
          schema_version: 'task_graph.v1',
          nodes: [
            {
              id: 'step_1',
              label: 'delegate system_engineer',
              kind: 'delegate',
              status: 'running',
              targetAgent: 'system_engineer',
              data: {
                step_id: 'step_1',
              },
            },
          ],
          edges: [],
          updated_at: 1_724_800_000_300,
        },
      })
    })

    await waitFor(() => {
      expect(result.current.activeTask?.graph?.nodes[0]?.id).toBe('step_1')
      expect(result.current.activeTask?.graph?.nodes[0]?.status).toBe('running')
    })

    unmount()
  })

  it('falls back to polling when SSE connection fails', async () => {
    vi.useFakeTimers()

    const { result, unmount } = renderHook(() => useRiskAgentWorkspace())

    await act(async () => {
      await Promise.resolve()
      await Promise.resolve()
    })

    expect(getAgents).toHaveBeenCalledTimes(1)
    expect(getMemory).toHaveBeenCalledTimes(1)
    expect(FakeEventSource.instances).toHaveLength(1)

    act(() => {
      FakeEventSource.instances[0].emitConnectionError()
    })

    expect(result.current.realtimeSyncMode).toBe('fallback')

    await act(async () => {
      vi.advanceTimersByTime(POLLING_INTERVAL)
      await Promise.resolve()
      await Promise.resolve()
    })

    expect(getAgents).toHaveBeenCalledTimes(2)
    expect(getMemory).toHaveBeenCalledTimes(2)

    unmount()
  })
})
