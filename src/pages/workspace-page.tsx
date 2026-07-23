import { Link } from 'react-router'

import { DetailPanel } from '@/components/business/detail-panel'
import { EventTimeline } from '@/components/business/event-timeline'
import { TaskListPanel } from '@/components/business/task-list-panel'
import { WorkspaceCanvas } from '@/components/business/workspace-canvas'
import { AppShell } from '@/components/layout/app-shell'
import {
  workspaceAgentDetails,
  workspaceEdges,
  workspaceEvents,
  workspaceKpis,
  workspaceNodes,
  workspaceTasks,
} from '@/utils/mock-data'

import styles from './workspace-page.module.css'

export function WorkspacePage() {
  const activeDetail = workspaceAgentDetails[0]

  return (
    <AppShell
      headline="多智能体协作工作台"
      subline="以 Figma 风格三栏布局承载任务分发、协作画布、角色详情和底部事件流，作为后续接入 Zustand 与 SSE 的页面骨架。"
      actions={
        <Link to="/settings" className={styles.actionLink}>
          配置运行环境
        </Link>
      }
    >
      <section className={styles.workspaceGrid}>
        <aside className={styles.leftRail}>
          <TaskListPanel kpis={workspaceKpis} tasks={workspaceTasks} />
        </aside>

        <section className={styles.centerRail}>
          <WorkspaceCanvas nodes={workspaceNodes} edges={workspaceEdges} />
        </section>

        <aside className={styles.rightRail}>
          <DetailPanel detail={activeDetail} />
        </aside>
      </section>

      <section className={styles.bottomPanel}>
        <EventTimeline events={workspaceEvents} />
      </section>
    </AppShell>
  )
}
