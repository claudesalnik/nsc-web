'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Car, CreditCard, History, LogOut } from 'lucide-react';
import clsx from 'clsx';

import styles from './PortalLayout.module.css';

const navItems = [
  { label: 'Dashboard', href: '/portal', icon: LayoutDashboard },
  { label: 'My Vehicles', href: '/portal#vehicles', icon: Car },
  { label: 'Billing', href: '/portal/billing', icon: CreditCard },
  { label: 'Access History', href: '/portal#access-history', icon: History },
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href.startsWith('/portal#')) {
      return pathname === '/portal';
    }

    if (href === '/portal') {
      return pathname === '/portal';
    }

    return pathname.startsWith(href);
  };

  return (
    <div className={styles.portalShell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>NSC Members</div>

        <nav className={styles.navList}>
          {navItems.map(({ label, href, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              className={clsx(styles.navLink, isActive(href) && styles.navLinkActive)}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>

        <button className={clsx(styles.logoutButton, styles.sidebarLogout)} type="button">
          <LogOut size={16} />
          Logout
        </button>
      </aside>

      <div className={styles.content}>
        <div className={styles.mobileHeader}>
          <span>NSC Member Portal</span>
          <button className={styles.logoutButton} type="button">
            <LogOut size={16} />
            Logout
          </button>
        </div>

        <main className={styles.main}>{children}</main>

        <nav className={styles.mobileNav}>
          {navItems.map(({ label, href, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              className={clsx(styles.mobileNavLink, isActive(href) && styles.mobileNavLinkActive)}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
