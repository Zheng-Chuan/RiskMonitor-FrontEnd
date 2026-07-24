import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { createDraftTask, createTask, getAgents, getTask } from '@/api/riskmonitor-api'
import { useAgentStore } from '@/store/agent-store'
import { useTaskStore } from '@/store/task-store'
import { POLLING_INTERVAL } from '@/utils/constants'
import type { Agent, Task, TaskStatus } from '@/types'

function isTerminalTaskStatus(status: TaskStatus): boolean {
  return status === 'completed' || status === 'failed' || status === 'cancelled'
}

export function useRiskMonitorWorkspace() {
  const [draft, setDraft] = useState('查询所有 desk 头寸')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRefreshingAgents, setIsRefreshingAgents] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [agentsError, setAgentsError] = useState<string | null>(null)
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null)
  const pollTimerRef = useRef<number | null>(null)

  const tasks = useTaskStore((state) => state.tasks)
  const taskOrder = useTaskStore((state) => state.taskOrder)
  const activeTaskId = useTaskStore((state) => state.activeTaskId)
  const addTask = useTaskStore((state) => state.addTask)
  const updateTask = useTaskStore((state) => state.updateTask)
  const setActiveTask = useTaskStore((state) => state.setActiveTask)

  const agents = useAgentStore((state) => state.agents)
  const addAgent = useAgentStore((state) => state.addAgent)
  const updateAgent = useAgentStore((state) => state.updateAgent)
  const setActiveAgents = useAgentStore((state) => state.setActiveAgents)
  const setLeadAgent = useAgentStore((state) => state.setLeadAgent)

  const orderedTasks = useMemo(
    () => taskOrder.map((id) => tasks[id]).filter((task): task is Task => Boolean(task)),
    [taskOrder, tasks],
  )

  const orderedAgents = useMemo(() => {
    return Object.values(agents).sort((left, right) => right.lastActiveAt - left.lastActiveAt)
  }, [agents])

  const activeTask = activeTaskId ? tasks[activeTaskId] ?? null : orderedTasks[0] ?? null

  const clearPolling = useCallback(() => {
    if (pollTimerRef.current !== null) {
      window.clearTimeout(pollTimerRef.current)
      pollTimerRef.current = null
    }
  }, [])

  const syncAgentsToStore = useCallback(
    (items: Agent[]) => {
      items.forEach((agent) => {
        if (agents[agent.id]) {
          updateAgent(agent.id, agent)
          return
        }
        addAgent(agent)
      })

      setActiveAgents(items.map((agent) => agent.id))
      const leadAgent = items.find((agent) => agent.role === 'lead') ?? null
      setLeadAgent(leadAgent?.id ?? null)
    },
    [addAgent, agents, setActiveAgents, setLeadAgent, updateAgent],
  )

  const refreshAgents = useCallback(async () => {
    setIsRefreshingAgents(true)

    try {
      const snapshot = await getAgents()
      syncAgentsToStore(snapshot.items)
      setAgentsError(null)
      setLastSyncedAt(snapshot.updatedAt)
    } catch (error) {
      const message = error instanceof Error ? error.message : '智能体状态获取失败'
      setAgentsError(message)
    } finally {
      setIsRefreshingAgents(false)
    }
  }, [syncAgentsToStore])

  const pollTask = useCallback(
    async (taskId: string) => {
      try {
        const task = await getTask(taskId)
        updateTask(taskId, task)
        setLastSyncedAt(task.updatedAt ?? Date.now())
        setSubmitError(null)

        if (!isTerminalTaskStatus(task.status)) {
          pollTimerRef.current = window.setTimeout(() => {
            void pollTask(taskId)
          }, POLLING_INTERVAL)
          return
        }

        clearPolling()
        await refreshAgents()
      } catch (error) {
        const message = error instanceof Error ? error.message : '任务状态轮询失败'
        setSubmitError(message)
        clearPolling()
      }
    },
    [clearPolling, refreshAgents, updateTask],
  )

  const submitTask = useCallback(async () => {
    const description = draft.trim()

    if (!description) {
      setSubmitError('请输入任务描述')
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)
    clearPolling()

    try {
      const response = await createTask({ description })
      const draftTask = createDraftTask(response.task_id, description, response.created_at)
      addTask(draftTask)
      setActiveTask(response.task_id)
      setDraft('')
      await pollTask(response.task_id)
    } catch (error) {
      const message = error instanceof Error ? error.message : '任务提交失败'
      setSubmitError(message)
    } finally {
      setIsSubmitting(false)
    }
  }, [addTask, clearPolling, draft, pollTask, setActiveTask])

  useEffect(() => {
    void refreshAgents()

    return () => {
      clearPolling()
    }
  }, [clearPolling, refreshAgents])

  return {
    activeTask,
    agentsError,
    draft,
    hasTasks: orderedTasks.length > 0,
    isRefreshingAgents,
    isSubmitting,
    lastSyncedAt,
    orderedAgents,
    orderedTasks,
    refreshAgents,
    setActiveTask,
    setDraft,
    submitError,
    submitTask,
  }
}
