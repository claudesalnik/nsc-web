'use client';

import { useTransition } from 'react';
import { LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';

export function SignOutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() =>
        startTransition(() => {
          void signOut({ callbackUrl: '/login' });
        })
      }
      className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)] transition hover:border-[var(--blue)]"
      disabled={isPending}
    >
      <LogOut size={14} />
      {isPending ? 'Signing out…' : 'Sign out'}
    </button>
  );
}
