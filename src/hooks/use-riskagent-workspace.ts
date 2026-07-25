import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import {
  createDraftTask,
  createTask,
  getAgents,
  getMemory,
  getTask,
  getTaskGraph,
  getTaskMemory,
  mapTaskGraphSnapshot,
} from '@/api/riskagent-api'
import { workspaceStreamClient } from '@/api/sse-client'
import { useAgentStore } from '@/store/agent-store'
import { useTaskStore } from '@/store/task-store'
import { POLLING_INTERVAL } from '@/utils/constants'
import type { Agent, GraphSnapshotStreamEvent, MemoryItem, MemorySnapshotSummary, Task, TaskStatus } from '@/types'

export type RealtimeSyncMode = 'connecting' | 'live' | 'fallback'

function isTerminalTaskStatus(status: TaskStatus): boolean {
  return status === 'completed' || status === 'failed' || status === 'cancelled'
}

export function useRiskAgentWorkspace() {
  const [draft, setDraft] = useState('查询所有 desk 头寸')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRefreshingAgents, setIsRefreshingAgents] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [agentsError, setAgentsError] = useState<string | null>(null)
  const [memoryError, setMemoryError] = useState<string | null>(null)
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null)
  const [lastMemorySyncedAt, setLastMemorySyncedAt] = useState<number | null>(null)
  const [memoryItems, setMemoryItems] = useState<MemoryItem[]>([])
  const [memorySummary, setMemorySummary] = useState<MemorySnapshotSummary | null>(null)
  const [isRefreshingMemory, setIsRefreshingMemory] = useState(false)
  const [realtimeSyncMode, setRealtimeSyncMode] = useState<RealtimeSyncMode>('connecting')
  const pollTimerRef = useRef<number | null>(null)
  const fallbackTimerRef = useRef<number | null>(null)

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

  const clearFallbackPolling = useCallback(() => {
    if (fallbackTimerRef.current !== null) {
      window.clearInterval(fallbackTimerRef.current)
      fallbackTimerRef.current = null
    }
  }, [])

  const syncAgentsToStore = useCallback(
    (items: Agent[]) => {
      const currentAgents = useAgentStore.getState().agents

      items.forEach((agent) => {
        if (currentAgents[agent.id]) {
          updateAgent(agent.id, agent)
          return
        }
        addAgent(agent)
      })

      setActiveAgents(items.map((agent) => agent.id))
      const leadAgent = items.find((agent) => agent.role === 'lead') ?? null
      setLeadAgent(leadAgent?.id ?? null)
    },
    [addAgent, setActiveAgents, setLeadAgent, updateAgent],
  )

  const refreshAgents = useCallback(async (options?: { manual?: boolean }) => {
    const isManual = options?.manual === true
    if (isManual) {
      setIsRefreshingAgents(true)
    }

    try {
      const snapshot = await getAgents()
      syncAgentsToStore(snapshot.items)
      setAgentsError(null)
      setLastSyncedAt(snapshot.updatedAt)
    } catch (error) {
      const message = error instanceof Error ? error.message : '智能体状态获取失败'
      setAgentsError(message)
    } finally {
      if (isManual) {
        setIsRefreshingAgents(false)
      }
    }
  }, [syncAgentsToStore])

  const refreshMemory = useCallback(async (taskId?: string | null, options?: { manual?: boolean }) => {
    const isManual = options?.manual === true
    if (isManual) {
      setIsRefreshingMemory(true)
    }

    try {
      const snapshot = taskId ? await getTaskMemory(taskId) : await getMemory()
      setMemoryItems(snapshot.items)
      setMemorySummary(snapshot.summary ?? null)
      setLastMemorySyncedAt(snapshot.updatedAt)
      setMemoryError(null)
    } catch (error) {
      const message = error instanceof Error ? error.message : '记忆面板刷新失败'
      setMemoryError(message)
    } finally {
      if (isManual) {
        setIsRefreshingMemory(false)
      }
    }
  }, [])

  const refreshTaskGraph = useCallback(async (taskId?: string | null) => {
    if (!taskId) {
      return
    }

    try {
      const graph = await getTaskGraph(taskId)
      updateTask(taskId, {
        graph,
        updatedAt: Math.max(useTaskStore.getState().tasks[taskId]?.updatedAt ?? 0, graph.updatedAt),
      })
    } catch {
      // 图快照允许晚于任务详情到达 不阻断主链路
    }
  }, [updateTask])

  const pollTask = useCallback(
    async (taskId: string) => {
      try {
        const task = await getTask(taskId)
        updateTask(taskId, task)
        void refreshTaskGraph(taskId)
        setLastSyncedAt(task.updatedAt ?? Date.now())
        setSubmitError(null)

        if (!isTerminalTaskStatus(task.status)) {
          pollTimerRef.current = window.setTimeout(() => {
            void pollTask(taskId)
          }, POLLING_INTERVAL)
          return
        }

        clearPolling()
        if (!(typeof window !== 'undefined' && 'EventSource' in window)) {
          await refreshAgents()
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : '任务状态轮询失败'
        setSubmitError(message)
        clearPolling()
      }
    },
    [clearPolling, refreshAgents, refreshTaskGraph, updateTask],
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
    const supportsRealtime = typeof window !== 'undefined' && 'EventSource' in window
    setRealtimeSyncMode(supportsRealtime ? 'connecting' : 'fallback')
    void refreshAgents()
    void refreshMemory(activeTask?.id ?? null)
    void refreshTaskGraph(activeTask?.id ?? null)

    if (supportsRealtime) {
      workspaceStreamClient.connect(
        {
          onOpen: () => {
            setRealtimeSyncMode('live')
            setAgentsError(null)
            setMemoryError(null)
            clearFallbackPolling()
          },
          onAgentSnapshot: (event) => {
            syncAgentsToStore(event.data.items)
            setAgentsError(null)
            setLastSyncedAt(event.updated_at)
          },
          onMemorySnapshot: (event) => {
            setMemoryItems(event.data.items)
            setMemorySummary(event.data.summary ?? null)
            setMemoryError(null)
            setLastMemorySyncedAt(event.updated_at)
          },
          onGraphSnapshot: (event: GraphSnapshotStreamEvent) => {
            if (!activeTask?.id) {
              return
            }
            const graph = mapTaskGraphSnapshot(event.data)
            updateTask(activeTask.id, {
              graph,
              updatedAt: Math.max(useTaskStore.getState().tasks[activeTask.id]?.updatedAt ?? 0, graph.updatedAt),
            })
          },
          onErrorEvent: (event) => {
            if (event.code === 'NOT_FOUND') {
              setMemoryError(event.message)
            }
          },
          onConnectionError: () => {
            setRealtimeSyncMode('fallback')
            if (fallbackTimerRef.current !== null) {
              return
            }
            fallbackTimerRef.current = window.setInterval(() => {
              void refreshAgents()
              void refreshMemory(activeTask?.id ?? null)
              void refreshTaskGraph(activeTask?.id ?? null)
            }, POLLING_INTERVAL)
          },
        },
        {
          taskId: activeTask?.id ?? null,
        },
      )
    } else {
      setRealtimeSyncMode('fallback')
      fallbackTimerRef.current = window.setInterval(() => {
        void refreshAgents()
        void refreshMemory(activeTask?.id ?? null)
        void refreshTaskGraph(activeTask?.id ?? null)
      }, POLLING_INTERVAL)
    }

    return () => {
      clearPolling()
      clearFallbackPolling()
      workspaceStreamClient.disconnect()
    }
  }, [
    activeTask?.id,
    clearFallbackPolling,
    clearPolling,
    refreshAgents,
    refreshMemory,
    refreshTaskGraph,
    syncAgentsToStore,
    updateTask,
  ])

  return {
    activeTask,
    agentsError,
    draft,
    hasTasks: orderedTasks.length > 0,
    isRefreshingAgents,
    isRefreshingMemory,
    isSubmitting,
    lastMemorySyncedAt,
    lastSyncedAt,
    memoryError,
    memoryItems,
    memorySummary,
    orderedAgents,
    orderedTasks,
    realtimeSyncMode,
    refreshAgents,
    refreshMemory,
    setActiveTask,
    setDraft,
    submitError,
    submitTask,
  }
}
