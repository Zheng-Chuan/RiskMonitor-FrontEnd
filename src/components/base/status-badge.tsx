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
}

export function StatusBadge({ label, tone }: StatusBadgeProps) {
  return <span className={`${styles.badge} ${styles[tone]}`}>{label}</span>
}
