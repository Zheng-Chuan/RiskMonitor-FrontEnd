import { useAgentStore } from '@/store/agent-store'
import { useTaskStore } from '@/store/task-store'
import type { Agent, Task } from '@/types'

const TASK_STORE_INITIAL_STATE = {
  tasks: {},
  taskOrder: [],
  activeTaskId: null,
  filter: 'all',
}

const AGENT_STORE_INITIAL_STATE = {
  agents: {},
  activeAgentIds: [],
  leadAgentId: null,
}

function buildTask(id: string): Task {
  return {
    id,
    title: `任务 ${id}`,
    description: `描述 ${id}`,
    status: 'pending',
    priority: 'medium',
    dependencies: [],
    artifacts: [],
    subtasks: [],
    createdAt: 1_724_800_000_000,
    updatedAt: 1_724_800_000_000,
    steps: [],
  }
}

function buildAgent(id: string): Agent {
  return {
    id,
    role: 'engineer',
    name: `Agent ${id}`,
    status: 'idle',
    capabilities: ['analyze'],
    createdAt: 1_724_800_000_000,
    lastActiveAt: 1_724_800_000_000,
  }
}

describe('zustand stores', () => {
  beforeEach(() => {
    useTaskStore.setState(TASK_STORE_INITIAL_STATE)
    useAgentStore.setState(AGENT_STORE_INITIAL_STATE)
  })

  it('stores tasks and updates active task state', () => {
    const task = buildTask('task_1')

    useTaskStore.getState().addTask(task)
    useTaskStore.getState().setActiveTask(task.id)
    useTaskStore.getState().updateTask(task.id, {
      status: 'completed',
      resultSummary: '任务已完成',
    })

    const state = useTaskStore.getState()

    expect(state.taskOrder).toEqual(['task_1'])
    expect(state.activeTaskId).toBe('task_1')
    expect(state.tasks.task_1.status).toBe('completed')
    expect(state.tasks.task_1.resultSummary).toBe('任务已完成')
  })

  it('stores agents and tracks active and lead agents', () => {
    const agent = buildAgent('system_engineer')

    useAgentStore.getState().addAgent(agent)
    useAgentStore.getState().updateAgent(agent.id, {
      status: 'working',
      currentTaskId: 'task_1',
    })
    useAgentStore.getState().setActiveAgents([agent.id])
    useAgentStore.getState().setLeadAgent(agent.id)

    const state = useAgentStore.getState()

    expect(state.agents.system_engineer.status).toBe('working')
    expect(state.agents.system_engineer.currentTaskId).toBe('task_1')
    expect(state.activeAgentIds).toEqual(['system_engineer'])
    expect(state.leadAgentId).toBe('system_engineer')
  })
})
