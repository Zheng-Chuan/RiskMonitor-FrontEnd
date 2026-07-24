import styles from './status-badge.module.css'

type StatusTone =
  | 'idle'
  | 'assigned'
  | 'working'
  | 'completed'
  | 'failed'
  | 'pending'
  | 'cancelled'

interface StatusBadgeProps {
  label: string
  tone: StatusTone
  dataTestId?: string
}

export function StatusBadge({ label, tone, dataTestId }: StatusBadgeProps) {
  return <span className={`${styles.badge} ${styles[tone]}`} data-testid={dataTestId}>{label}</span>
}
