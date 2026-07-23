import { SurfaceCard } from '@/components/base/surface-card'
import type { WorkspaceEvent } from '@/types'

import styles from './event-timeline.module.css'

interface EventTimelineProps {
  events: WorkspaceEvent[]
}

export function EventTimeline({ events }: EventTimelineProps) {
  return (
    <SurfaceCard
      title="事件流与日志"
      eyebrow="Timeline"
      aside={<span className={styles.caption}>SSE / 审查 / 测试统一入口</span>}
    >
      <div className={styles.tabs}>
        <span className={`${styles.tab} ${styles.tabActive}`}>时间线</span>
        <span className={styles.tab}>日志</span>
        <span className={styles.tab}>错误</span>
        <span className={styles.tab}>测试结果</span>
      </div>

      <div className={styles.timeline}>
        {events.map((event) => (
          <article key={event.id} className={styles.eventRow}>
            <div className={`${styles.dot} ${styles[event.tone]}`} />
            <div className={styles.eventContent}>
              <div className={styles.eventHeader}>
                <strong>{event.title}</strong>
                <time className={styles.time}>{event.time}</time>
              </div>
              <p className={styles.description}>{event.description}</p>
            </div>
          </article>
        ))}
      </div>
    </SurfaceCard>
  )
}
