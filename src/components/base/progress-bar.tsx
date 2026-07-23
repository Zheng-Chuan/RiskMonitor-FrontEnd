import styles from './progress-bar.module.css'

interface ProgressBarProps {
  value: number
}

export function ProgressBar({ value }: ProgressBarProps) {
  const safeValue = Math.max(0, Math.min(100, value))

  return (
    <div className={styles.track} aria-label={`进度 ${safeValue}%`} role="progressbar" aria-valuenow={safeValue} aria-valuemin={0} aria-valuemax={100}>
      <span className={styles.fill} style={{ width: `${safeValue}%` }} />
    </div>
  )
}
