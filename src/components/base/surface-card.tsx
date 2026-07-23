import type { PropsWithChildren, ReactNode } from 'react'

import styles from './surface-card.module.css'

interface SurfaceCardProps extends PropsWithChildren {
  title?: string
  eyebrow?: string
  aside?: ReactNode
  className?: string
}

export function SurfaceCard({
  title,
  eyebrow,
  aside,
  className,
  children,
}: SurfaceCardProps) {
  const rootClassName = className ? `${styles.card} ${className}` : styles.card

  return (
    <section className={rootClassName}>
      {(title || eyebrow || aside) && (
        <header className={styles.header}>
          <div>
            {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
            {title ? <h3 className={styles.title}>{title}</h3> : null}
          </div>
          {aside ? <div className={styles.aside}>{aside}</div> : null}
        </header>
      )}
      <div className={styles.content}>{children}</div>
    </section>
  )
}
