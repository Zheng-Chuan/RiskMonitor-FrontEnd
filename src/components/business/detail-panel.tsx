import { StatusBadge } from '@/components/base/status-badge'
import { SurfaceCard } from '@/components/base/surface-card'
import type { WorkspaceAgentDetail } from '@/types'
import { getAgentRoleLabel, getStatusLabel } from '@/utils/workspace-presenters'

import styles from './detail-panel.module.css'

interface DetailPanelProps {
  detail: WorkspaceAgentDetail
}

export function DetailPanel({ detail }: DetailPanelProps) {
  return (
    <div className={styles.panel}>
      <SurfaceCard
        title={detail.name}
        eyebrow={getAgentRoleLabel(detail.role)}
        aside={<StatusBadge label={getStatusLabel(detail.status)} tone={detail.status} />}
      >
        <div className={styles.section}>
          <span className={styles.sectionLabel}>当前任务</span>
          <p className={styles.primaryText}>{detail.currentTask}</p>
        </div>

        <div className={styles.section}>
          <span className={styles.sectionLabel}>角色摘要</span>
          <p className={styles.secondaryText}>{detail.summary}</p>
        </div>

        <div className={styles.metricList}>
          {detail.metrics.map((metric) => (
            <span key={metric} className={styles.metricChip}>
              {metric}
            </span>
          ))}
        </div>
      </SurfaceCard>

      <SurfaceCard title={detail.outputTitle} eyebrow="Output">
        <p className={styles.secondaryText}>{detail.outputSummary}</p>
      </SurfaceCard>

      <SurfaceCard title="关联产物" eyebrow="Artifacts">
        <div className={styles.artifactList}>
          {detail.artifacts.map((artifact) => (
            <article key={artifact.id} className={styles.artifactCard}>
              <div className={styles.artifactHeader}>
                <strong>{artifact.title}</strong>
                <span className={styles.artifactType}>{artifact.type}</span>
              </div>
              <p className={styles.secondaryText}>{artifact.summary}</p>
            </article>
          ))}
        </div>
      </SurfaceCard>
    </div>
  )
}
