"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { CarFront, CreditCard, KeyRound, LayoutDashboard, LogOut, Phone, ShieldCheck, UserRound } from "lucide-react";
import clsx from "clsx";
import { ReactNode, useCallback } from "react";

import { ResponsiveLayout } from "@/components/layout/ResponsiveLayout";
import { MobileGateQuickView } from "@/components/layout/MobileGateQuickView";

const PORTAL_LINKS = [
  { label: "Overview", href: "/portal", icon: LayoutDashboard },
  { label: "Vehicles", href: "/portal/vehicles", icon: CarFront },
  { label: "Access", href: "/portal/access", icon: KeyRound },
  { label: "Billing", href: "/portal/billing", icon: CreditCard },
  { label: "Profile", href: "/portal/profile", icon: UserRound },
];

type ConciergeMeta = {
  label: string;
  value: string;
  href: string;
  statusLine: string;
};

type HeroMeta = {
  locationLabel: string;
  title: string;
  subtitle?: string;
};

type QuickAccessMeta = {
  gateName: string;
  primaryCode: string;
  secondaryCode?: string;
  validUntil?: string;
  lastRefreshed?: string;
  spotLabel?: string;
  rowLabel?: string;
};

type PortalChromeProps = {
  children: ReactNode;
  memberName: string;
  memberSubtitle?: string;
  spotLabel?: string;
  concierge: ConciergeMeta;
  hero: HeroMeta;
  quickAccess?: QuickAccessMeta;
};

export function PortalChrome({ children, memberName, memberSubtitle, spotLabel, concierge, hero, quickAccess }: PortalChromeProps) {
  const pathname = usePathname();

  const handleLogout = useCallback(() => {
    void signOut({ callbackUrl: "/login?session=expired" });
  }, []);

  const DesktopSidebar = (
    <div className="flex h-full flex-col justify-between bg-[rgba(var(--surface2-rgb),0.95)] px-6 py-8">
      <div className="space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-[rgba(var(--text-rgb),0.45)]">Member</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--text)]">{memberName}</p>
          <p className="text-sm text-[rgba(var(--text-rgb),0.65)]">{memberSubtitle ?? "NSC Member"}</p>
        </div>

        <nav className="space-y-1">
          {PORTAL_LINKS.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  "tappable-area flex items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-sm font-semibold tracking-[0.08em]",
                  "text-[rgba(var(--text-rgb),0.7)] transition",
                  active &&
                    "border-[rgba(var(--blue-rgb),0.45)] bg-[rgba(var(--blue-rgb),0.1)] text-[var(--text)] shadow-[0_16px_40px_rgba(5,10,18,0.55)]"
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="space-y-3 rounded-3xl border border-[rgba(var(--border-rgb),0.45)] bg-[rgba(var(--surface3-rgb),0.7)] p-4">
        <div className="flex items-center gap-3 text-sm text-[rgba(var(--text-rgb),0.75)]">
          <ShieldCheck className="h-5 w-5 text-[var(--blue)]" aria-hidden="true" />
          {concierge.statusLine}
        </div>
        <a href={concierge.href} className="flex items-center justify-between rounded-2xl border border-[rgba(var(--border-rgb),0.45)] bg-[rgba(var(--surface-rgb),0.45)] px-4 py-3 text-sm text-[var(--text)]">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-[rgba(var(--text-rgb),0.5)]">{concierge.label}</p>
            <p className="text-base font-semibold">{concierge.value}</p>
          </div>
          <Phone className="h-5 w-5 text-[var(--blue)]" aria-hidden="true" />
        </a>
        <button
          type="button"
          onClick={handleLogout}
          className="tappable-area flex w-full items-center justify-center gap-2 rounded-2xl border border-[rgba(var(--border-rgb),0.45)] px-4 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-[rgba(var(--text-rgb),0.8)]"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Logout
        </button>
      </div>
    </div>
  );

  const MobileHeader = (
    <div className="space-y-3 py-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.5em] text-[rgba(var(--text-rgb),0.55)]">NSC Member</p>
          <p className="text-lg font-semibold text-[var(--text)]">
            {memberName}
            {spotLabel ? ` · Spot ${spotLabel}` : ""}
          </p>
          <p className="text-xs text-[rgba(var(--text-rgb),0.6)]">{concierge.statusLine}</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="tappable-area inline-flex items-center gap-2 rounded-2xl border border-[rgba(var(--border-rgb),0.45)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[rgba(var(--text-rgb),0.75)]"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Logout
        </button>
      </div>
      {quickAccess && (
        <MobileGateQuickView
          gateName={quickAccess.gateName}
          primaryCode={quickAccess.primaryCode}
          secondaryCode={quickAccess.secondaryCode}
          spotLabel={quickAccess.spotLabel ?? spotLabel}
          rowLabel={quickAccess.rowLabel}
          validUntil={quickAccess.validUntil}
          lastRefreshed={quickAccess.lastRefreshed}
          conciergeHref={concierge.href}
        />
      )}
    </div>
  );

  const DesktopHeader = (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="text-xs uppercase tracking-[0.5em] text-[rgba(var(--text-rgb),0.55)]">{hero.locationLabel}</p>
        <p className="mt-1 text-2xl font-semibold text-[var(--text)]">{hero.title}</p>
        <p className="text-sm text-[rgba(var(--text-rgb),0.6)]">{hero.subtitle ?? concierge.statusLine}</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <a
          href={concierge.href}
          className="tappable-area inline-flex items-center gap-2 rounded-2xl border border-[rgba(var(--border-rgb),0.45)] px-4 py-3 text-sm font-semibold tracking-[0.1em] text-[var(--text)]"
        >
          <Phone className="h-4 w-4" aria-hidden="true" />
          Call concierge
        </a>
        <button
          type="button"
          className="tappable-area inline-flex items-center gap-2 rounded-2xl border border-[rgba(var(--blue-rgb),0.45)] bg-[rgba(var(--blue-rgb),0.12)] px-4 py-3 text-sm font-semibold tracking-[0.1em] text-[var(--text)]"
        >
          <KeyRound className="h-4 w-4" aria-hidden="true" />
          Share gate code
        </button>
      </div>
    </div>
  );

  return (
    <ResponsiveLayout
      mobileHeader={MobileHeader}
      desktopSidebar={DesktopSidebar}
      desktopHeader={DesktopHeader}
      contentClassName="space-y-6 pb-8"
    >
      {children}
    </ResponsiveLayout>
  );
}
