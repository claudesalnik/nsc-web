"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LogOut } from "lucide-react";
import clsx from "clsx";

import { Logo } from "@/components/ui/Logo";
import { MobileNav, NAV_ITEMS } from "./MobileNav";

type UserSummary = {
  name: string;
  title?: string;
  avatarUrl?: string;
};

type AppShellProps = {
  title?: string;
  subtitle?: string;
  user?: UserSummary;
  actions?: ReactNode;
  onSignOut?: () => void;
  children: ReactNode;
};

export const AppShell = ({ title, subtitle, user, actions, onSignOut, children }: AppShellProps) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname() ?? "/";

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      {/* Mobile/Tablet top bar */}
      <header className="sticky top-0 z-40 border-b border-[rgba(var(--border-rgb),0.35)] bg-[rgba(var(--bg-rgb),0.85)] backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-[rgba(var(--text-rgb),0.45)]">NSC</p>
              <p className="text-base font-semibold text-[var(--text)]">Sunday Club</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setDrawerOpen((prev) => !prev)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(var(--border-rgb),0.5)] bg-[rgba(var(--surface2-rgb),0.6)] text-[var(--text)] transition hover:border-[rgba(var(--border-rgb),0.9)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--blue)]"
            aria-label={drawerOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={drawerOpen}
          >
            {drawerOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </header>

      <div className="relative flex min-h-screen w-full">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex lg:w-72 xl:w-80 lg:flex-col lg:justify-between lg:border-r lg:border-[rgba(var(--border-rgb),0.35)] lg:bg-[var(--surface2)] lg:px-6 lg:py-8">
          <div>
            <Logo size="md" className="mb-8" />
            <NavList pathname={pathname} />
          </div>
          <ClubFooter user={user} onSignOut={onSignOut} />
        </aside>

        {/* Page content */}
        <main className="relative flex-1 px-4 pb-28 pt-6 sm:px-6 md:px-8 lg:pb-12 lg:pl-10 lg:pr-14">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
            {(title || subtitle || user || actions) && (
              <div className="flex flex-col gap-4 rounded-3xl border border-[rgba(var(--border-rgb),0.4)] bg-gradient-to-br from-[rgba(var(--text-rgb),0.08)] via-transparent to-transparent p-5 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl md:flex-row md:items-center md:justify-between">
                <div>
                  {title && <h1 className="text-2xl font-semibold tracking-tight text-[var(--text)] md:text-3xl">{title}</h1>}
                  {subtitle && <p className="mt-1 text-sm text-[rgba(var(--text-rgb),0.6)] md:text-base">{subtitle}</p>}
                </div>
                <div className="flex flex-col gap-3 text-sm text-[rgba(var(--text-rgb),0.75)] md:flex-row md:items-center">
                  {user && (
                    <div className="flex items-center gap-3">
                      <Avatar name={user.name} avatarUrl={user.avatarUrl} />
                      <div className="leading-tight">
                        <p className="font-semibold text-[var(--text)]">{user.name}</p>
                        {user.title && <p className="text-[rgba(var(--text-rgb),0.6)]">{user.title}</p>}
                      </div>
                    </div>
                  )}
                  {actions}
                </div>
              </div>
            )}

            {children}
          </div>
        </main>
      </div>

      {/* Tablet drawer */}
      <Drawer open={drawerOpen} onClose={closeDrawer}>
        <NavList pathname={pathname} onNavigate={closeDrawer} />
        <ClubFooter user={user} compact onSignOut={onSignOut} />
      </Drawer>

      {/* Mobile bottom nav */}
      <div className="md:hidden">
        <MobileNav />
      </div>
    </div>
  );
};

type DrawerProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
};

const Drawer = ({ open, onClose, children }: DrawerProps) => (
  <div
    className={clsx(
      "fixed inset-0 z-50 bg-black/0 transition-all duration-300 ease-out lg:hidden",
      open ? "pointer-events-auto bg-black/40" : "pointer-events-none"
    )}
    aria-hidden={!open}
  >
    <div
      className={clsx(
        "absolute inset-y-0 right-0 flex w-80 max-w-[80%] flex-col border-l border-[rgba(var(--border-rgb),0.35)] bg-[var(--surface2)] p-6 shadow-[0_25px_90px_rgba(0,0,0,0.65)] transition-transform duration-300 ease-out",
        open ? "translate-x-0" : "translate-x-full"
      )}
      role="dialog"
      aria-modal="true"
      aria-label="Navigation drawer"
    >
      <button
        type="button"
        onClick={onClose}
        className="mb-6 flex h-11 w-11 items-center justify-center self-end rounded-full border border-[rgba(var(--border-rgb),0.5)] text-[rgba(var(--text-rgb),0.75)] transition hover:border-[rgba(var(--border-rgb),0.9)] hover:text-[var(--text)]"
        aria-label="Close drawer"
      >
        <X className="h-5 w-5" aria-hidden="true" />
      </button>
      {children}
    </div>
    {open && (
      <button
        type="button"
        aria-label="Close navigation overlay"
        className="absolute inset-0 w-full"
        onClick={onClose}
      />
    )}
  </div>
);

type NavListProps = {
  pathname: string;
  onNavigate?: () => void;
};

const NavList = ({ pathname, onNavigate }: NavListProps) => (
  <nav aria-label="Primary" className="space-y-2">
    {NAV_ITEMS.map((item) => {
      const isActive =
        pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));

      return (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className={clsx(
            "flex items-center gap-4 rounded-2xl border border-transparent px-4 py-3 text-sm font-medium transition",
            "bg-transparent text-[rgba(var(--text-rgb),0.6)] hover:border-[rgba(var(--border-rgb),0.6)] hover:bg-[rgba(var(--surface2-rgb),0.45)] hover:text-[var(--text)]",
            isActive &&
              "border-[rgba(var(--blue-rgb),0.45)] bg-[rgba(var(--blue-rgb),0.12)] text-[var(--text)] shadow-[0_10px_35px_rgba(6,16,25,0.6)]"
          )}
          aria-current={isActive ? "page" : undefined}
        >
          <item.icon className="h-5 w-5" aria-hidden="true" />
          {item.label}
        </Link>
      );
    })}
  </nav>
);

type AvatarProps = {
  name: string;
  avatarUrl?: string;
};

const Avatar = ({ name, avatarUrl }: AvatarProps) => {
  if (avatarUrl) {
    return (
      <span className="inline-flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-[rgba(var(--border-rgb),0.4)] bg-[rgba(var(--surface3-rgb),0.65)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
      </span>
    );
  }

  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((segment) => segment.charAt(0))
    .join("")
    .toUpperCase();

  return (
    <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[rgba(var(--border-rgb),0.4)] bg-[rgba(var(--blue-rgb),0.2)] text-sm font-semibold text-[var(--text)]">
      {initials}
    </span>
  );
};

type ClubFooterProps = {
  user?: UserSummary;
  compact?: boolean;
  onSignOut?: () => void;
};

const ClubFooter = ({ user, compact = false, onSignOut }: ClubFooterProps) => (
  <div
    className={clsx(
      "mt-8 rounded-3xl border border-[rgba(var(--border-rgb),0.45)] bg-gradient-to-br from-[rgba(var(--text-rgb),0.08)] via-transparent to-transparent p-5 text-sm text-[rgba(var(--text-rgb),0.7)]",
      compact && "mt-6"
    )}
  >
    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[rgba(var(--text-rgb),0.4)]">Garage Access</p>
    <div className="mt-3 flex items-center justify-between gap-3">
      <div>
        <p className="text-base font-semibold text-[var(--text)]">{user?.name ?? "Member"}</p>
        <p className="text-xs text-[rgba(var(--text-rgb),0.55)]">{user?.title ?? "Active membership"}</p>
      </div>
      <button
        type="button"
        onClick={onSignOut}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(var(--border-rgb),0.5)] text-[rgba(var(--text-rgb),0.75)] transition hover:border-[rgba(var(--border-rgb),0.9)] hover:text-[var(--text)]"
        aria-label="Sign out"
      >
        <LogOut className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  </div>
);
