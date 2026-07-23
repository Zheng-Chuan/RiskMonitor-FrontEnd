import { ProgressBar } from '@/components/base/progress-bar'
import { StatusBadge } from '@/components/base/status-badge'
import { SurfaceCard } from '@/components/base/surface-card'
import type { WorkspaceKpi, WorkspaceTaskSummary } from '@/types'
import {
  getAgentRoleLabel,
  getPriorityLabel,
  getStatusLabel,
} from '@/utils/workspace-presenters'

import styles from './task-list-panel.module.css'

interface TaskListPanelProps {
  kpis: WorkspaceKpi[]
  tasks: WorkspaceTaskSummary[]
}

export function TaskListPanel({ kpis, tasks }: TaskListPanelProps) {
  return (
    <div className={styles.panel}>
      <SurfaceCard title="工作台概览" eyebrow="Overview">
        <div className={styles.kpiGrid}>
          {kpis.map((kpi) => (
            <article key={kpi.id} className={styles.kpiCard}>
              <span className={styles.kpiLabel}>{kpi.label}</span>
              <strong className={styles.kpiValue}>{kpi.value}</strong>
              <span className={styles.kpiHint}>{kpi.hint}</span>
            </article>
          ))}
        </div>
      </SurfaceCard>

      <SurfaceCard title="任务列表" eyebrow="Tasks" aside={<span className={styles.count}>{tasks.length} 项</span>}>
        <div className={styles.taskList}>
          {tasks.map((task) => (
            <article key={task.id} className={styles.taskCard}>
              <div className={styles.taskHeader}>
                <div>
                  <p className={styles.taskTitle}>{task.title}</p>
                  <p className={styles.taskMeta}>
                    {task.phase} · {getAgentRoleLabel(task.ownerRole)} · 更新于 {task.updatedAtLabel}
                  </p>
                </div>
                <StatusBadge label={getStatusLabel(task.status)} tone={task.status === 'in_progress' ? 'working' : task.status} />
              </div>

              <div className={styles.tagRow}>
                <span className={styles.tag}>优先级 {getPriorityLabel(task.priority)}</span>
                <span className={styles.tag}>阶段 {task.phase}</span>
              </div>

              <div className={styles.progressGroup}>
                <div className={styles.progressMeta}>
                  <span>当前进度</span>
                  <strong>{task.progress}%</strong>
                </div>
                <ProgressBar value={task.progress} />
              </div>
            </article>
          ))}
        </div>
      </SurfaceCard>
    </div>
  )
}
