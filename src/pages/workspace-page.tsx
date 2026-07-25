import { Link } from 'react-router'

import { StatusBadge } from '@/components/base/status-badge'
import { SurfaceCard } from '@/components/base/surface-card'
import { AppShell } from '@/components/layout/app-shell'
import { useRiskMonitorWorkspace } from '@/hooks/use-riskmonitor-workspace'
import { formatTimestamp } from '@/utils/format'
import { getAgentRoleLabel, getPriorityLabel, getStatusLabel } from '@/utils/workspace-presenters'

import styles from './workspace-page.module.css'

function getTaskTone(status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled') {
  switch (status) {
    case 'in_progress':
      return 'working'
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

function getMemoryChangeLabel(changeType: 'created' | 'updated' | 'compressed' | 'archived') {
  switch (changeType) {
    case 'updated':
      return '更新'
    case 'compressed':
      return '沉淀'
    case 'archived':
      return '归档'
    case 'created':
    default:
      return '新增'
  }
}

function getMemoryScopeLabel(scope: 'shared' | 'private') {
  return scope === 'private' ? '私有记忆' : '共享记忆'
}

export function WorkspacePage() {
  const {
    activeTask,
    agentsError,
    draft,
    hasTasks,
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
    refreshAgents,
    refreshMemory,
    setActiveTask,
    setDraft,
    submitError,
    submitTask,
  } = useRiskMonitorWorkspace()

  const completedTasks = orderedTasks.filter((task) => task.status === 'completed').length
  const workingAgents = orderedAgents.filter((agent) => agent.status === 'working').length
  const activeArtifacts = activeTask?.artifacts ?? []

  return (
    <AppShell
      headline="最小 Demo 工作台"
      subline="围绕 REST BFF 和轮询协议实现任务提交, 智能体状态展示和结果回显. 这一页是当前联调和云端验收的主入口."
      actions={
        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.actionButton}
            onClick={() => {
              void refreshAgents()
            }}
          >
            {isRefreshingAgents ? '刷新中' : '刷新智能体'}
          </button>
          <button
            type="button"
            className={styles.actionButtonSecondary}
            onClick={() => {
              void refreshMemory(activeTask?.id ?? null)
            }}
          >
            {isRefreshingMemory ? '记忆刷新中' : '刷新记忆'}
          </button>
          <Link to="/settings" className={styles.actionLink}>
            接口与部署约束
          </Link>
        </div>
      }
    >
      <section className={styles.summaryGrid}>
        <SurfaceCard title="当前任务数" eyebrow="Tasks">
          <div className={styles.metricValue} data-testid="metric-task-count">{orderedTasks.length}</div>
          <p className={styles.metricHint}>已提交并在前端状态树中登记的任务数量.</p>
        </SurfaceCard>
        <SurfaceCard title="已完成任务" eyebrow="Completion">
          <div className={styles.metricValue} data-testid="metric-completed-count">{completedTasks}</div>
          <p className={styles.metricHint}>进入 completed 状态的任务数量.</p>
        </SurfaceCard>
        <SurfaceCard title="活跃智能体" eyebrow="Agents">
          <div className={styles.metricValue} data-testid="metric-working-agents">{workingAgents}</div>
          <p className={styles.metricHint}>当前状态为 working 的智能体数量.</p>
        </SurfaceCard>
        <SurfaceCard title="最近同步" eyebrow="Sync">
          <div className={styles.metricValue} data-testid="metric-last-sync">{lastSyncedAt ? formatTimestamp(lastSyncedAt) : '--:--:--'}</div>
          <p className={styles.metricHint}>来自 /api/agents 或 /api/tasks/{'{id}'} 的最近更新时间.</p>
        </SurfaceCard>
      </section>

      <section className={styles.workspaceGrid}>
        <aside className={styles.leftRail}>
          <SurfaceCard title="提交任务" eyebrow="Task Input">
            <div className={styles.formSection}>
              <label className={styles.fieldLabel} htmlFor="task-description">
                输入任务描述
              </label>
              <textarea
                id="task-description"
                data-testid="task-description-input"
                className={styles.textarea}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="例如. 查询所有 desk 头寸并汇总主要风险暴露"
                rows={6}
              />
              <div className={styles.formFooter}>
                <button
                  type="button"
                  data-testid="submit-task-button"
                  className={styles.submitButton}
                  onClick={() => void submitTask()}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? '提交中' : '提交任务'}
                </button>
                <p className={styles.formHint}>建议从一个明确的查询任务开始, 先打通最小联调链路.</p>
              </div>
              {submitError ? <p className={styles.errorMessage} data-testid="submit-error">{submitError}</p> : null}
            </div>
          </SurfaceCard>

          <SurfaceCard title="任务列表" eyebrow="Task Queue" aside={<span className={styles.queueHint}>{orderedTasks.length} 条</span>}>
            {hasTasks ? (
              <div className={styles.taskList} data-testid="task-list">
                {orderedTasks.map((task) => (
                  <button
                    key={task.id}
                    data-testid={`task-item-${task.id}`}
                    type="button"
                    className={task.id === activeTask?.id ? `${styles.taskItem} ${styles.taskItemActive}` : styles.taskItem}
                    onClick={() => setActiveTask(task.id)}
                  >
                    <div className={styles.taskItemHeader}>
                      <strong>{task.title}</strong>
                      <StatusBadge label={getStatusLabel(task.status)} tone={getTaskTone(task.status)} />
                    </div>
                    <p className={styles.taskItemDescription}>{task.description}</p>
                    <div className={styles.taskItemMeta}>
                      <span>优先级 {getPriorityLabel(task.priority)}</span>
                      <span>{formatTimestamp(task.updatedAt ?? task.createdAt)}</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <strong>还没有任务</strong>
                <p>提交第一条任务后, 这里会开始显示轮询状态和结果摘要.</p>
              </div>
            )}
          </SurfaceCard>
        </aside>

        <section className={styles.centerRail}>
          <SurfaceCard
            title={activeTask ? activeTask.title : '任务详情'}
            eyebrow="Active Task"
            aside={
              activeTask ? (
                <StatusBadge
                  label={getStatusLabel(activeTask.status)}
                  tone={getTaskTone(activeTask.status)}
                  dataTestId="active-task-status"
                />
              ) : undefined
            }
          >
            {activeTask ? (
              <div className={styles.detailSection} data-testid="active-task-panel">
                <div className={styles.detailMeta}>
                  <div>
                    <span className={styles.metaLabel}>任务 ID</span>
                    <code data-testid="active-task-id">{activeTask.id}</code>
                  </div>
                  <div>
                    <span className={styles.metaLabel}>最近更新时间</span>
                    <strong data-testid="active-task-updated-at">{formatTimestamp(activeTask.updatedAt ?? activeTask.createdAt)}</strong>
                  </div>
                </div>

                <p className={styles.description} data-testid="active-task-description">{activeTask.description}</p>

                <div className={styles.contentGrid}>
                  <div className={styles.sectionBlock}>
                    <h3>执行步骤</h3>
                    {activeTask.steps && activeTask.steps.length > 0 ? (
                      <div className={styles.stepList} data-testid="task-steps">
                        {activeTask.steps.map((step) => (
                          <article key={step.id} className={styles.stepItem} data-testid={`task-step-${step.id}`}>
                            <div>
                              <strong>{step.title}</strong>
                              <p className={styles.stepMeta}>{step.id}</p>
                            </div>
                            <StatusBadge label={getStatusLabel(step.status)} tone={getTaskTone(step.status)} />
                          </article>
                        ))}
                      </div>
                    ) : (
                      <p className={styles.placeholderText} data-testid="task-steps-placeholder">后端返回步骤后, 这里会展示意图识别, 规划, 执行等阶段.</p>
                    )}
                  </div>

                  <div className={styles.sectionBlock}>
                    <h3>结果摘要</h3>
                    {activeTask.resultSummary ? (
                      <p className={styles.resultText} data-testid="task-result-summary">{activeTask.resultSummary}</p>
                    ) : (
                      <p className={styles.placeholderText} data-testid="task-result-placeholder">任务还没有返回 summary. 当状态进入 completed 时, 这里会显示最终结论.</p>
                    )}

                    {activeTask.errorMessage ? <p className={styles.errorMessage} data-testid="task-error-message">{activeTask.errorMessage}</p> : null}
                  </div>
                </div>

                <div className={styles.sectionBlock}>
                  <h3>产出物</h3>
                  {activeArtifacts.length > 0 ? (
                    <div className={styles.artifactList} data-testid="artifact-list">
                      {activeArtifacts.map((artifact) => (
                        <article key={artifact.id} className={styles.artifactItem}>
                          <div className={styles.artifactHeader}>
                            <strong>{artifact.title}</strong>
                            <span>{artifact.type}</span>
                          </div>
                          <p className={styles.artifactContent}>{artifact.content}</p>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <p className={styles.placeholderText} data-testid="artifact-placeholder">当前没有产出物. 后续报告, 结论和结构化结果都会落在这里.</p>
                  )}
                </div>
              </div>
            ) : (
              <div className={styles.emptyState}>
                <strong>请选择一个任务</strong>
                <p>左侧提交或选择任务后, 这里会显示步骤, 结果和错误信息.</p>
              </div>
            )}
          </SurfaceCard>
        </section>

        <aside className={styles.rightRail}>
          <SurfaceCard title="智能体状态" eyebrow="Agents" aside={<span className={styles.queueHint}>{orderedAgents.length} 个</span>}>
            {agentsError ? <p className={styles.warningMessage} data-testid="agents-error">{agentsError}</p> : null}

            {orderedAgents.length > 0 ? (
              <div className={styles.agentList} data-testid="agent-list">
                {orderedAgents.map((agent) => (
                  <article key={agent.id} className={styles.agentItem} data-testid={`agent-item-${agent.id}`}>
                    <div className={styles.agentHeader}>
                      <div>
                        <strong>{agent.name}</strong>
                        <p className={styles.agentRole}>{getAgentRoleLabel(agent.role)}</p>
                      </div>
                      <StatusBadge label={getStatusLabel(agent.status)} tone={agent.status} />
                    </div>
                    <div className={styles.agentMeta}>
                      <span>最近活跃 {formatTimestamp(agent.lastActiveAt)}</span>
                      <span>{agent.currentTaskId ? `任务 ${agent.currentTaskId}` : '暂无任务'}</span>
                    </div>
                    <div className={styles.capabilityList}>
                      {agent.capabilities.length > 0 ? (
                        agent.capabilities.map((capability) => (
                          <span key={capability} className={styles.capabilityTag}>
                            {capability}
                          </span>
                        ))
                      ) : (
                        <span className={styles.capabilityTag}>等待能力数据</span>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <strong>智能体列表暂不可用</strong>
                <p>如果后端尚未实现 /api/agents, 页面会保留这个提示并继续允许本地布局验证.</p>
              </div>
            )}
          </SurfaceCard>

          <SurfaceCard
            title="系统记忆"
            eyebrow="Memory Panel"
            aside={<span className={styles.queueHint}>{memoryItems.length} 条</span>}
          >
            <div className={styles.memoryPanelMeta}>
              <div className={styles.memorySummary}>
                <span data-testid="memory-shared-count">共享 {memorySummary?.sharedCount ?? 0}</span>
                <span data-testid="memory-private-count">私有 {memorySummary?.privateCount ?? 0}</span>
                <span data-testid="memory-agent-count">Agent {memorySummary?.agentCount ?? 0}</span>
              </div>
              <span className={styles.memorySyncText} data-testid="memory-last-sync">
                {lastMemorySyncedAt ? `最近刷新 ${formatTimestamp(lastMemorySyncedAt)}` : '最近刷新 --:--:--'}
              </span>
            </div>

            {memoryError ? <p className={styles.errorMessage} data-testid="memory-error">{memoryError}</p> : null}

            {memoryItems.length > 0 ? (
              <div className={styles.memoryList} data-testid="memory-panel">
                {memoryItems.map((item) => (
                  <article key={item.id} className={styles.memoryItem} data-testid={`memory-item-${item.id}`}>
                    <div className={styles.memoryItemHeader}>
                      <div className={styles.memoryItemTitleBlock}>
                        <strong>{item.agentId}</strong>
                        <span className={styles.memoryScope}>{getMemoryScopeLabel(item.scope)}</span>
                      </div>
                      <span className={`${styles.memoryChangeBadge} ${styles[`memoryChange${item.changeType[0].toUpperCase()}${item.changeType.slice(1)}`]}`}>
                        {getMemoryChangeLabel(item.changeType)}
                      </span>
                    </div>
                    <p className={styles.memorySummaryText} data-testid={`memory-summary-${item.id}`}>{item.summary}</p>
                    <div className={styles.memoryMetaRow}>
                      <span>{item.kind}</span>
                      <span>{item.memoryType}</span>
                      <span>{formatTimestamp(item.createdAt)}</span>
                    </div>
                    {item.details.length > 0 ? (
                      <ul className={styles.memoryDetailList}>
                        {item.details.map((detail) => (
                          <li key={`${item.id}-${detail}`}>{detail}</li>
                        ))}
                      </ul>
                    ) : null}
                  </article>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState} data-testid="memory-panel-empty">
                <strong>当前暂无系统记忆</strong>
                <p>任务开始执行后, 这里会展示 Agent 内部记忆变化.</p>
              </div>
            )}
          </SurfaceCard>
        </aside>
      </section>
    </AppShell>
  )
}
