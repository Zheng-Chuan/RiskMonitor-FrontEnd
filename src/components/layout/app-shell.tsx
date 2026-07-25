import type { PropsWithChildren, ReactNode } from 'react'

import styles from './app-shell.module.css'

interface AppShellProps extends PropsWithChildren {
  headline: string
  subline: string
  actions?: ReactNode
}

export function AppShell({ headline, subline, actions, children }: AppShellProps) {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.brandBlock}>
          <div className={styles.logo}>RM</div>
          <div className={styles.brandText}>
            <p className={styles.productName}>RiskAgent BackEnd</p>
            <h1 className={styles.headline}>{headline}</h1>
            <p className={styles.subline}>{subline}</p>
          </div>
        </div>

        <div className={styles.headerRight}>
          {actions ? <div className={styles.actions}>{actions}</div> : null}
        </div>
      </header>

      <main className={styles.main}>{children}</main>
    </div>
  )
}
