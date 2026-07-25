import { expect, test, type Page } from '@playwright/test'

async function submitRealTask(page: Page, taskDescription: string) {
  await page.goto('/')
  await expect(page.getByTestId('agent-list')).toBeVisible()
  await expect(page.getByTestId('task-description-input')).toBeVisible()
  await expect(page.getByTestId('realtime-status')).toBeVisible()
  await page.getByTestId('task-description-input').fill(taskDescription)
  await page.getByTestId('submit-task-button').click()
  await expect(page.getByTestId('task-list')).toBeVisible()
  await expect(page.getByTestId('active-task-panel')).toBeVisible()
  await expect(page.getByTestId('active-task-description')).toHaveText(taskDescription)
  await expect(page.getByTestId('active-task-id')).not.toHaveText('')
}

async function expectMemoryPanelSettled(page: Page) {
  const memoryPanel = page.getByTestId('memory-panel')
  const memoryEmpty = page.getByTestId('memory-panel-empty')

  await expect(async () => {
    const hasPanel = await memoryPanel.isVisible().catch(() => false)
    const hasEmpty = await memoryEmpty.isVisible().catch(() => false)
    expect(hasPanel || hasEmpty).toBe(true)
  }).toPass({ timeout: 15_000, intervals: [500, 1_000, 2_000] })
}

test.describe('workspace real page integration', () => {
  test('shows validation error when submitting an empty task', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByTestId('task-description-input')).toBeVisible()
    await expect(page.getByTestId('realtime-status')).toBeVisible()
    await page.getByTestId('task-description-input').fill('   ')
    await page.getByTestId('submit-task-button').click()

    await expect(page.getByTestId('submit-error')).toHaveText('请输入任务描述')
    await expect(page.getByTestId('metric-task-count')).toHaveText('0')
  })

  test('submits a real task and displays live agent snapshot', async ({ page }) => {
    const taskDescription = `页面真实联调测试 ${Date.now()}`

    await submitRealTask(page, taskDescription)

    await expect(page.getByTestId('metric-working-agents')).toBeVisible()
    await expect(page.getByTestId('agent-item-system_engineer')).toBeVisible()
    await expect(page.getByTestId('agent-item-risk_analyst')).toBeVisible()
    await expect(page.getByTestId('metric-task-count')).not.toHaveText('0')
    await expect(page.getByTestId('memory-last-sync')).not.toHaveText('最近刷新 --:--:--')
    await expectMemoryPanelSettled(page)
  })

  test('loads real memory panel snapshot and supports manual refresh', async ({ page }) => {
    await page.goto('/')

    await page.waitForResponse((response) => response.url().includes('/api/memory') && response.ok())
    await expect(page.getByRole('button', { name: '刷新智能体' })).toBeVisible()
    await expect(page.getByTestId('realtime-status')).toBeVisible()
    await expect(page.getByTestId('memory-shared-count')).toBeVisible()
    await expect(page.getByTestId('memory-private-count')).toBeVisible()
    await expect(page.getByTestId('memory-agent-count')).toBeVisible()
    await expect(page.getByTestId('memory-last-sync')).not.toHaveText('最近刷新 --:--:--')
    await expect(page.getByTestId('memory-section-shared')).toBeVisible()
    await expect(page.getByTestId('memory-section-private')).toBeVisible()
    await expectMemoryPanelSettled(page)

    const refreshResponse = page.waitForResponse((response) => response.url().includes('/api/memory') && response.ok())
    await page.getByTestId('memory-refresh-button').click()
    await refreshResponse
    await expect(page.getByTestId('memory-last-sync')).not.toHaveText('最近刷新 --:--:--')
    await expectMemoryPanelSettled(page)

    await page.getByTestId('memory-panel-toggle').click()
    await expect(page.getByTestId('memory-panel-collapsed')).toBeVisible()
    await page.getByTestId('memory-panel-toggle').click()
    await expect(page.getByTestId('memory-section-shared')).toBeVisible()
  })

  test('observes real task status progression during polling', async ({ page }) => {
    const taskDescription = `长轮询状态测试 ${Date.now()}`

    await submitRealTask(page, taskDescription)
    await expect(page.getByTestId('active-task-status')).toHaveText('待处理')

    await expect(async () => {
      const currentStatus = await page.getByTestId('active-task-status').textContent()
      expect(['执行中', '已完成', '失败', '已取消']).toContain((currentStatus ?? '').trim())
    }).toPass({ timeout: 20_000, intervals: [500, 1_000, 2_000] })

    await expect(page.getByTestId('metric-last-sync')).not.toHaveText('--:--:--')
  })

  test('renders real result area and artifact area after task submission', async ({ page }) => {
    const taskDescription = `结果区真实联调测试 ${Date.now()}`

    await submitRealTask(page, taskDescription)

    const taskSummary = page.getByTestId('task-result-summary')
    const taskPlaceholder = page.getByTestId('task-result-placeholder')
    const taskError = page.getByTestId('task-error-message')
    const artifactList = page.getByTestId('artifact-list')
    const artifactPlaceholder = page.getByTestId('artifact-placeholder')

    await expect(async () => {
      const hasSummary = await taskSummary.isVisible().catch(() => false)
      const hasPlaceholder = await taskPlaceholder.isVisible().catch(() => false)
      const hasError = await taskError.isVisible().catch(() => false)
      const hasArtifactList = await artifactList.isVisible().catch(() => false)
      const hasArtifactPlaceholder = await artifactPlaceholder.isVisible().catch(() => false)

      expect(hasSummary || hasPlaceholder || hasError).toBe(true)
      expect(hasArtifactList || hasArtifactPlaceholder).toBe(true)
    }).toPass({ timeout: 20_000, intervals: [500, 1_000, 2_000] })
  })

  test('requests task scoped memory after submitting a real task', async ({ page }) => {
    const taskDescription = `记忆面板真实联调测试 ${Date.now()}`

    await submitRealTask(page, taskDescription)
    await page.waitForResponse((response) => /\/api\/tasks\/.+\/memory/.test(response.url()) && response.ok())

    await expect(page.getByTestId('memory-last-sync')).not.toHaveText('最近刷新 --:--:--')
    await expectMemoryPanelSettled(page)

    const memoryPanel = page.getByTestId('memory-panel')
    if (await memoryPanel.isVisible().catch(() => false)) {
      await expect(page.locator('[data-testid^="memory-summary-"]').first()).not.toHaveText('')
    }
  })
})
