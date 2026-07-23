import type { PropsWithChildren, ReactNode } from 'react'
import { NavLink } from 'react-router'

import styles from './app-shell.module.css'

interface AppShellProps extends PropsWithChildren {
  headline: string
  subline: string
  actions?: ReactNode
}

const navItems = [
  { to: '/', label: '首页' },
  { to: '/workspace', label: '工作台' },
  { to: '/settings', label: '设置' },
]

export function AppShell({ headline, subline, actions, children }: AppShellProps) {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.brandBlock}>
          <div className={styles.logo}>RM</div>
          <div className={styles.brandText}>
            <p className={styles.productName}>RiskMonitor MultiAgent</p>
            <h1 className={styles.headline}>{headline}</h1>
            <p className={styles.subline}>{subline}</p>
          </div>
        </div>

        <div className={styles.headerRight}>
          <nav className={styles.nav}>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  isActive ? `${styles.navItem} ${styles.navItemActive}` : styles.navItem
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          {actions ? <div className={styles.actions}>{actions}</div> : null}
        </div>
      </header>

      <main className={styles.main}>{children}</main>
    </div>
  )
}
