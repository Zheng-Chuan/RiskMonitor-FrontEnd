import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'

import { useRiskMonitorWorkspace } from '@/hooks/use-riskmonitor-workspace'
import { WorkspacePage } from '@/pages/workspace-page'

vi.mock('@/hooks/use-riskmonitor-workspace', () => ({
  useRiskMonitorWorkspace: vi.fn(),
}))

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
  vi.mocked(useRiskMonitorWorkspace).mockReturnValue(buildWorkspaceState(overrides) as never)
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

    expect(screen.getByTestId('memory-panel-empty')).toBeInTheDocument()
    expect(screen.getByText('当前暂无系统记忆')).toBeInTheDocument()
    expect(screen.getByTestId('memory-last-sync')).toHaveTextContent('最近刷新 --:--:--')
  })

  it('renders memory refresh loading state on refresh button', () => {
    renderWorkspace({
      isRefreshingMemory: true,
    })

    expect(screen.getByTestId('memory-refresh-button')).toHaveTextContent('记忆刷新中')
  })

  it('renders memory error state when memory request fails', () => {
    renderWorkspace({
      memoryError: '记忆面板刷新失败',
    })

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
      ],
    })

    expect(screen.getByTestId('memory-panel')).toBeInTheDocument()
    expect(screen.getByTestId('memory-shared-count')).toHaveTextContent('共享 1')
    expect(screen.getByTestId('memory-private-count')).toHaveTextContent('私有 1')
    expect(screen.getByTestId('memory-agent-count')).toHaveTextContent('Agent 2')
    expect(screen.getByTestId('memory-summary-mem_1')).toHaveTextContent('已同步最近任务状态')
  })
})
