import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'

import { useRiskAgentWorkspace } from '@/hooks/use-riskagent-workspace'
import { WorkspacePage } from '@/pages/workspace-page'

vi.mock('@/hooks/use-riskagent-workspace', () => ({
  useRiskAgentWorkspace: vi.fn(),
}))

class FakeResizeObserver {
  observe(): void {
    return
  }

  unobserve(): void {
    return
  }

  disconnect(): void {
    return
  }
}

globalThis.ResizeObserver = FakeResizeObserver as unknown as typeof ResizeObserver

function buildWorkspaceState(overrides: Record<string, unknown> = {}) {
  return {
    activeTask: null,
    agentsError: null,
    draft: '',
    hasTasks: false,
    isRefreshingAgents: false,
    isRefreshingMemory: false,
    isSubmitting: false,
    lastMemorySyncedAt: null,
    lastSyncedAt: null,
    memoryError: null,
    memoryItems: [],
    memorySummary: null,
    orderedAgents: [],
    orderedTasks: [],
    realtimeSyncMode: 'live',
    refreshAgents: vi.fn(),
    refreshMemory: vi.fn(),
    setActiveTask: vi.fn(),
    setDraft: vi.fn(),
    submitError: null,
    submitTask: vi.fn(),
    ...overrides,
  }
}

function renderWorkspace(overrides: Record<string, unknown> = {}) {
  vi.mocked(useRiskAgentWorkspace).mockReturnValue(buildWorkspaceState(overrides) as never)
  return render(
    <MemoryRouter>
      <WorkspacePage />
    </MemoryRouter>,
  )
}

describe('WorkspacePage memory states', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders memory empty state when there are no memory items', () => {
    renderWorkspace()

    expect(screen.getByTestId('realtime-status')).toHaveTextContent('SSE 实时推送中')
    expect(screen.getByTestId('memory-panel-empty')).toBeInTheDocument()
    expect(screen.getByText('当前暂无系统记忆')).toBeInTheDocument()
    expect(screen.getByTestId('memory-last-sync')).toHaveTextContent('最近刷新 --:--:--')
  })

  it('renders memory refresh loading state on refresh button', () => {
    renderWorkspace({
      isRefreshingMemory: true,
    })

    expect(screen.getByTestId('memory-refresh-button')).toHaveTextContent('正在刷新记忆')
  })

  it('renders memory error state when memory request fails', () => {
    renderWorkspace({
      memoryError: '记忆面板刷新失败',
      realtimeSyncMode: 'fallback',
    })

    expect(screen.getByTestId('realtime-status')).toHaveTextContent('降级到轮询同步')
    expect(screen.getByTestId('memory-error')).toHaveTextContent('记忆面板刷新失败')
  })

  it('renders structured memory items when memory exists', () => {
    renderWorkspace({
      lastMemorySyncedAt: 1_724_800_000_000,
      memorySummary: {
        sharedCount: 1,
        privateCount: 1,
        agentCount: 2,
      },
      memoryItems: [
        {
          id: 'mem_1',
          taskId: 'task_1',
          sessionId: 'session_1',
          agentId: 'system_engineer',
          scope: 'shared',
          kind: 'working_memory',
          memoryType: 'episodic',
          changeType: 'updated',
          summary: '已同步最近任务状态',
          details: ['来源 task_graph_execution'],
          tags: ['delegate'],
          confidence: 1,
          createdAt: 1_724_800_000_000,
        },
        {
          id: 'mem_2',
          taskId: 'task_1',
          sessionId: 'session_1',
          agentId: 'risk_analyst',
          scope: 'private',
          kind: 'private_task_state',
          memoryType: 'episodic',
          changeType: 'created',
          summary: '保留本地分析草稿',
          details: ['来源 private_agent_memory'],
          tags: ['draft'],
          confidence: 1,
          createdAt: 1_724_800_000_100,
        },
      ],
    })

    expect(screen.getByTestId('memory-panel')).toBeInTheDocument()
    expect(screen.getByTestId('memory-shared-count')).toHaveTextContent('公共 1')
    expect(screen.getByTestId('memory-private-count')).toHaveTextContent('私有 1')
    expect(screen.getByTestId('memory-agent-count')).toHaveTextContent('Agent 2')
    expect(screen.getByTestId('memory-section-shared')).toHaveTextContent('公共记忆 1 条')
    expect(screen.getByTestId('memory-section-private')).toHaveTextContent('私有记忆 1 条')
    expect(screen.getByTestId('memory-summary-mem_1')).toHaveTextContent('已同步最近任务状态')
    expect(screen.getByTestId('memory-summary-mem_2')).toHaveTextContent('保留本地分析草稿')
  })

  it('renders task graph section when active task includes DAG snapshot', () => {
    renderWorkspace({
      activeTask: {
        id: 'task_1',
        title: '检查风险暴露',
        description: '分析所有 desk 头寸',
        status: 'in_progress',
        priority: 'medium',
        dependencies: [],
        artifacts: [],
        subtasks: [],
        createdAt: 1_724_800_000_000,
        updatedAt: 1_724_800_000_000,
        graph: {
          taskId: 'task_1',
          sessionId: 'session_1',
          status: 'running',
          schemaVersion: 'task_graph.v1',
          updatedAt: 1_724_800_000_100,
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
        },
        steps: [],
      },
      hasTasks: true,
      orderedTasks: [
        {
          id: 'task_1',
          title: '检查风险暴露',
          description: '分析所有 desk 头寸',
          status: 'in_progress',
          priority: 'medium',
          dependencies: [],
          artifacts: [],
          subtasks: [],
          createdAt: 1_724_800_000_000,
          updatedAt: 1_724_800_000_000,
        },
      ],
    })

    expect(screen.getByText('TaskGraph')).toBeInTheDocument()
    expect(screen.getByTestId('task-graph-canvas')).toBeInTheDocument()
    expect(screen.getByTestId('task-graph-hover-panel')).toHaveTextContent('悬停查看详情')
  })

  it('supports collapsing and expanding memory panel', async () => {
    renderWorkspace({
      memorySummary: {
        sharedCount: 1,
        privateCount: 0,
        agentCount: 1,
      },
      memoryItems: [
        {
          id: 'mem_1',
          taskId: 'task_1',
          sessionId: 'session_1',
          agentId: 'system_engineer',
          scope: 'shared',
          kind: 'working_memory',
          memoryType: 'episodic',
          changeType: 'updated',
          summary: '已同步最近任务状态',
          details: ['来源 task_graph_execution'],
          tags: ['delegate'],
          confidence: 1,
          createdAt: 1_724_800_000_000,
        },
      ],
    })

    fireEvent.click(screen.getByTestId('memory-panel-toggle'))
    expect(screen.getByTestId('memory-panel-collapsed')).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('memory-panel-toggle'))
    expect(screen.getByTestId('memory-panel')).toBeInTheDocument()
  })
})
