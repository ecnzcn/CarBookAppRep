import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import styles from './AppShell.module.css';
import { navItems } from './navItems';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <nav className={styles.sidebar} aria-label="Primary">
        <div className={styles.sidebarBrand}>CarBook</div>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={styles.sidebarItem}
            style={({ isActive }) => ({
              background: isActive ? 'var(--color-bg)' : undefined,
              color: isActive ? 'var(--color-text)' : undefined,
            })}
          >
            <span aria-hidden="true">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <main className={styles.content}>{children}</main>

      <nav className={styles.bottomNav} aria-label="Primary">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={styles.navItem}
            style={({ isActive }) => ({
              color: isActive ? 'var(--color-accent)' : undefined,
            })}
          >
            <span className={styles.navIcon} aria-hidden="true">
              {item.icon}
            </span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
