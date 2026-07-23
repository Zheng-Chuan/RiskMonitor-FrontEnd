import { Link } from 'react-router'

import { SurfaceCard } from '@/components/base/surface-card'
import { AppShell } from '@/components/layout/app-shell'
import { settingsSections } from '@/utils/mock-data'

import styles from './settings-page.module.css'

export function SettingsPage() {
  return (
    <AppShell
      headline="系统设置与角色配置"
      subline="当前页先提供 Figma 风格的配置骨架，后续逐步接入 SSE 地址、角色开关、模型参数和主题偏好。"
      actions={
        <Link to="/workspace" className={styles.actionLink}>
          返回工作台
        </Link>
      }
    >
      <section className={styles.settingsGrid}>
        {settingsSections.map((section) => (
          <SurfaceCard key={section.id} title={section.title} eyebrow="Settings">
            <p className={styles.sectionDescription}>{section.description}</p>
            <div className={styles.itemList}>
              {section.items.map((item) => (
                <article key={item.id} className={styles.itemCard}>
                  <div className={styles.itemHeader}>
                    <strong>{item.label}</strong>
                    <span className={styles.itemValue}>{item.value}</span>
                  </div>
                  <p className={styles.itemHint}>{item.hint}</p>
                </article>
              ))}
            </div>
          </SurfaceCard>
        ))}
      </section>
    </AppShell>
  )
}
