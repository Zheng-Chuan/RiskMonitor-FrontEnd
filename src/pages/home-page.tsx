import { Link } from 'react-router'

import { SurfaceCard } from '@/components/base/surface-card'
import { AppShell } from '@/components/layout/app-shell'

import styles from './home-page.module.css'

const milestones = [
  {
    title: '提交任务',
    description: '通过 /api/tasks 提交自然语言任务, 获取 task_id 并进入轮询链路.',
  },
  {
    title: '轮询状态',
    description: '通过 /api/tasks/{task_id} 同步任务进度, 步骤状态和最终结果.',
  },
  {
    title: '展示智能体',
    description: '通过 /api/agents 展示当前参与协作的角色, 状态和能力摘要.',
  },
]

const principles = [
  '保留 FrontEnd 与 MultiAgent 的双应用边界',
  '浏览器只接 REST BFF, 不直接接 MCP 协议',
  'MVP 先做轮询, 暂不做 SSE 和 React Flow',
]

export function HomePage() {
  return (
    <AppShell
      headline="RiskMonitor MVP 前端工作台"
      subline="当前版本聚焦最小闭环. 输入任务, 轮询状态, 查看智能体协作结果, 为后续接入云端 K8s 部署做准备."
      actions={
        <>
          <Link to="/workspace" className={styles.primaryAction}>
            打开 MVP 工作台
          </Link>
          <Link to="/settings" className={styles.secondaryAction}>
            查看接入约束
          </Link>
        </>
      }
    >
      <section className={styles.heroGrid}>
        <SurfaceCard title="当前开发目标" eyebrow="Phase 0" className={styles.heroCard}>
          <div className={styles.heroContent}>
            <div className={styles.heroCopy}>
              <span className={styles.heroBadge}>REST BFF + Polling MVP</span>
              <h2 className={styles.heroTitle}>先把提交任务和结果展示跑通, 再演进为真正的多智能体协作前端</h2>
              <p className={styles.heroText}>
                这一版页面严格遵循文档约束. 首页负责说明目标和范围, 工作台负责最小任务闭环, 设置页负责展示接口协议和部署约束.
              </p>
              <ul className={styles.principleList}>
                {principles.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className={styles.heroPreview}>
              <div className={styles.previewHeader}>
                <span>提交</span>
                <span>轮询</span>
                <span>结果</span>
              </div>
              <div className={styles.previewBody}>
                <div className={styles.previewSidebar}>
                  <span className={styles.previewLabel}>POST /api/tasks</span>
                </div>
                <div className={styles.previewCanvas}>
                  <span className={styles.previewNode}>Lead</span>
                  <span className={styles.previewNode}>Research</span>
                  <span className={styles.previewNode}>Engineer</span>
                </div>
                <div className={styles.previewSidebar}>
                  <span className={styles.previewLabel}>GET /api/tasks/:id</span>
                </div>
              </div>
            </div>
          </div>
        </SurfaceCard>

        <SurfaceCard title="里程碑拆解" eyebrow="Milestones">
          <div className={styles.taskPreviewList}>
            {milestones.map((item, index) => (
              <article key={item.title} className={styles.taskPreviewCard}>
                <div>
                  <strong>
                    {index + 1}. {item.title}
                  </strong>
                  <p className={styles.taskPreviewMeta}>{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        </SurfaceCard>
      </section>

      <section className={styles.featureGrid}>
        {[
          {
            title: '工作台',
            description: '提交任务, 自动轮询, 聚合展示步骤, 结果和错误信息.',
          },
          {
            title: '接入层',
            description: 'HTTPClient 和 REST BFF 契约保持一致, 便于后端逐步补齐接口.',
          },
          {
            title: '部署路径',
            description: '前端已具备 Dockerfile, Helm 和 GitHub Actions staging 交付骨架.',
          },
        ].map((feature) => (
          <SurfaceCard key={feature.title} title={feature.title} eyebrow="Capability">
            <p className={styles.featureDescription}>{feature.description}</p>
          </SurfaceCard>
        ))}
      </section>
    </AppShell>
  )
}
