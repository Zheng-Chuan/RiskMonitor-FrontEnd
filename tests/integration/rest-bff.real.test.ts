// @vitest-environment node

import { createTask, getAgents, getTask } from '@/api/riskmonitor-api'
import type { Task } from '@/types'

const REQUIRED_API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const SNAPSHOT_TIMEOUT_MS = Number(import.meta.env.VITE_REST_BFF_TIMEOUT_MS ?? 30_000)
const SNAPSHOT_INTERVAL_MS = Number(import.meta.env.VITE_REST_BFF_POLL_INTERVAL_MS ?? 1_000)

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

async function waitForTaskSnapshot(
  taskId: string,
  predicate: (task: Task) => boolean,
  timeoutMs: number,
): Promise<Task> {
  const startedAt = Date.now()
  let latestTask = await getTask(taskId)

  while (!predicate(latestTask)) {
    if (Date.now() - startedAt > timeoutMs) {
      throw new Error(`task ${taskId} did not satisfy predicate within ${timeoutMs}ms`)
    }

    await sleep(SNAPSHOT_INTERVAL_MS)
    latestTask = await getTask(taskId)
  }

  return latestTask
}

describe('real REST BFF integration', () => {
  beforeAll(() => {
    if (!REQUIRED_API_BASE_URL) {
      throw new Error('VITE_API_BASE_URL is required for real REST integration tests')
    }
  })

  it('fetches real agents snapshot from multiagent service', async () => {
    const snapshot = await getAgents()

    expect(snapshot.updatedAt).toBeGreaterThan(0)
    expect(snapshot.items.length).toBeGreaterThan(0)
    expect(snapshot.items.some((agent) => agent.id === 'system_engineer')).toBe(true)
  })

  it('creates a real task and polls live task snapshots', async () => {
    const description = `前端真实联调测试 ${Date.now()}`
    const created = await createTask({ description })

    expect(created.task_id).toBeTruthy()
    expect(created.status).toBe('pending')
    expect(created.created_at).toBeGreaterThan(0)

    const firstSnapshot = await waitForTaskSnapshot(
      created.task_id,
      (task) => task.id === created.task_id,
      5_000,
    )

    expect(firstSnapshot.description).toBe(description)
    expect(['pending', 'in_progress', 'completed', 'failed', 'cancelled']).toContain(firstSnapshot.status)

    const progressedSnapshot = await waitForTaskSnapshot(
      created.task_id,
      (task) => task.status !== 'pending' || (task.steps?.length ?? 0) > 0,
      SNAPSHOT_TIMEOUT_MS,
    )

    expect(progressedSnapshot.description).toBe(description)
    expect(progressedSnapshot.updatedAt).toBeGreaterThanOrEqual(progressedSnapshot.createdAt)

    if (progressedSnapshot.status === 'completed') {
      expect(progressedSnapshot.resultSummary).toBeTruthy()
      return
    }

    if (progressedSnapshot.status === 'failed' || progressedSnapshot.status === 'cancelled') {
      expect(
        Boolean(progressedSnapshot.errorMessage)
        || (progressedSnapshot.steps?.length ?? 0) > 0,
      ).toBe(true)
      return
    }

    expect(progressedSnapshot.status).toBe('in_progress')
    expect(progressedSnapshot.updatedAt).toBeGreaterThanOrEqual(progressedSnapshot.createdAt)
    expect(progressedSnapshot.errorMessage ?? '').toBe('')
  })
})
