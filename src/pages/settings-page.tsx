import { Link } from 'react-router'

import { SurfaceCard } from '@/components/base/surface-card'
import { AppShell } from '@/components/layout/app-shell'

import styles from './settings-page.module.css'

export function SettingsPage() {
  return (
    <AppShell
      headline="系统设置与角色配置"
      subline="当前页先提供 Figma 风格的配置骨架，后续逐步接入 SSE 地址、角色开关、模型参数和主题偏好。"
      actions={
        <Link to="/workspace" className={styles.actionLink}>
          返回 MVP 工作台
        </Link>
      }
    >
      <section className={styles.settingsGrid}>
        <SurfaceCard title="当前接口契约" eyebrow="REST BFF">
          <p className={styles.sectionDescription}>
            当前阶段使用轮询协议. 前端只依赖 3 个核心接口, 并通过同域 `/api/*` 路径访问后端.
          </p>
          <div className={styles.itemList}>
            {[
              'POST /api/tasks',
              'GET /api/tasks/{task_id}',
              'GET /api/agents',
            ].map((item) => (
              <article key={item} className={styles.itemCard}>
                <div className={styles.itemHeader}>
                  <strong>{item}</strong>
                  <span className={styles.itemValue}>required</span>
                </div>
                <p className={styles.itemHint}>接口细节见 docs/architecture/rest-bff-contract.md</p>
              </article>
            ))}
          </div>
          </SurfaceCard>

        <SurfaceCard title="环境变量和运行约束" eyebrow="Deployment">
          <p className={styles.sectionDescription}>
            开发环境默认通过 Vite 代理访问后端. staging 环境使用 Ingress 同域代理.
          </p>
          <div className={styles.itemList}>
            <article className={styles.itemCard}>
              <div className={styles.itemHeader}>
                <strong>VITE_API_BASE_URL</strong>
                <span className={styles.itemValue}>optional</span>
              </div>
              <p className={styles.itemHint}>默认留空. 本地开发通过 vite.config.ts 的 /api 代理转发.</p>
            </article>
            <article className={styles.itemCard}>
              <div className={styles.itemHeader}>
                <strong>POLLING_INTERVAL</strong>
                <span className={styles.itemValue}>2000ms</span>
              </div>
              <p className={styles.itemHint}>当前轮询间隔固定为 2 秒. 由 src/utils/constants.ts 统一维护.</p>
            </article>
          </div>
        </SurfaceCard>

        <SurfaceCard title="已启用交付链路" eyebrow="CI CD">
          <p className={styles.sectionDescription}>
            FrontEnd 已具备快速版 staging 交付能力. 包括 Docker 构建, Helm 部署和 GitHub Actions 流水线.
          </p>
          <div className={styles.itemList}>
            {[
              'Dockerfile + Nginx 静态托管',
              'deploy/helm/riskmonitor-frontend',
              '.github/workflows/frontend-ci.yml',
              '.github/workflows/frontend-deploy-staging.yml',
            ].map((item) => (
              <article key={item} className={styles.itemCard}>
                <p className={styles.itemHint}>{item}</p>
              </article>
            ))}
          </div>
        </SurfaceCard>
      </section>
    </AppShell>
  )
}
