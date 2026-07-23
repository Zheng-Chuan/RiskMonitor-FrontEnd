import { Link } from 'react-router'

import { SurfaceCard } from '@/components/base/surface-card'
import { AppShell } from '@/components/layout/app-shell'
import { homeFeatures, workspaceTasks } from '@/utils/mock-data'
import { getPriorityLabel, getStatusLabel } from '@/utils/workspace-presenters'

import styles from './home-page.module.css'

export function HomePage() {
  return (
    <AppShell
      headline="多智能体协作前端工作台"
      subline="采用 Figma 风格信息布局，将任务拆解、协作画布、审查结果和实时事件流统一在一个前端工作区内。"
      actions={
        <>
          <Link to="/workspace" className={styles.primaryAction}>
            进入工作台
          </Link>
          <Link to="/settings" className={styles.secondaryAction}>
            查看配置
          </Link>
        </>
      }
    >
      <section className={styles.heroGrid}>
        <SurfaceCard title="产品定位" eyebrow="Hero" className={styles.heroCard}>
          <div className={styles.heroContent}>
            <div className={styles.heroCopy}>
              <span className={styles.heroBadge}>Figma Style Workspace</span>
              <h2 className={styles.heroTitle}>围绕 Lead、Research、Engineering、QA 的多面板协作体验</h2>
              <p className={styles.heroText}>
                首版代码骨架优先落三类页面：首页负责入口和任务概览，工作台负责主协作流，设置页负责 SSE、角色与主题配置。
              </p>
            </div>
            <div className={styles.heroPreview}>
              <div className={styles.previewHeader}>
                <span>任务队列</span>
                <span>协作画布</span>
                <span>详情面板</span>
              </div>
              <div className={styles.previewBody}>
                <div className={styles.previewSidebar} />
                <div className={styles.previewCanvas}>
                  <span className={styles.previewNode}>Lead</span>
                  <span className={styles.previewNode}>Engineer</span>
                  <span className={styles.previewNode}>QA</span>
                </div>
                <div className={styles.previewSidebar} />
              </div>
            </div>
          </div>
        </SurfaceCard>

        <SurfaceCard title="最近任务" eyebrow="Recent Tasks">
          <div className={styles.taskPreviewList}>
            {workspaceTasks.map((task) => (
              <article key={task.id} className={styles.taskPreviewCard}>
                <div>
                  <strong>{task.title}</strong>
                  <p className={styles.taskPreviewMeta}>
                    {getStatusLabel(task.status)} · 优先级 {getPriorityLabel(task.priority)}
                  </p>
                </div>
                <span className={styles.taskPreviewProgress}>{task.progress}%</span>
              </article>
            ))}
          </div>
        </SurfaceCard>
      </section>

      <section className={styles.featureGrid}>
        {homeFeatures.map((feature) => (
          <SurfaceCard key={feature.id} title={feature.title} eyebrow="Capability">
            <p className={styles.featureDescription}>{feature.description}</p>
          </SurfaceCard>
        ))}
      </section>
    </AppShell>
  )
}
