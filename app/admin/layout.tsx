'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldAlert } from 'lucide-react';
import type { ReactNode } from 'react';

const navItems = [
  { label: 'Overview', href: '/admin' },
  { label: 'Vehicles', href: '/admin/vehicles' },
  { label: 'Members', href: '/admin/members' },
  { label: 'Events', href: '/admin/events' },
  { label: 'Settings', href: '/admin/settings' },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        color: 'var(--text)',
        display: 'flex',
      }}
    >
      <aside
        style={{
          width: 220,
          background: 'var(--surface)',
          borderRight: '1px solid var(--border)',
          padding: '28px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          position: 'sticky',
          top: 0,
          height: '100vh',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ShieldAlert size={24} color="var(--amber)" />
          <div>
            <div style={{ fontSize: 12, letterSpacing: '0.08em', color: 'var(--muted)' }}>Newcastle Sunday Club</div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '3px 10px',
                borderRadius: 999,
                background: 'rgba(var(--amber-rgb),0.12)',
                color: 'var(--amber)',
                fontSize: 11,
                fontWeight: 700,
                marginTop: 6,
              }}
            >
              ADMIN
            </div>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {navItems.map((item) => {
            const active =
              pathname === item.href || (item.href !== '/admin' && pathname.startsWith(`${item.href}/`));
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  padding: '10px 14px',
                  borderRadius: 10,
                  textDecoration: 'none',
                  fontSize: 13,
                  fontWeight: 500,
                  color: active ? 'var(--bg)' : 'var(--muted)',
                  background: active ? 'var(--blue)' : 'transparent',
                  border: active ? '1px solid var(--blue)' : '1px solid transparent',
                  transition: 'all 0.2s',
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div
          style={{
            marginTop: 'auto',
            padding: 14,
            borderRadius: 12,
            border: '1px solid var(--border)',
            background: 'var(--surface2)',
            fontSize: 12,
            color: 'var(--muted)',
            lineHeight: 1.5,
          }}
        >
          Monitor check-ins, update billing, and manage member inventory.
        </div>
      </aside>

      <section style={{ flex: 1, padding: '32px 40px', minHeight: '100vh' }}>{children}</section>
    </div>
  );
}
