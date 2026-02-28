"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CarFront, Home, KeyRound, UserRound } from "lucide-react";
import clsx from "clsx";
import { ComponentType } from "react";

export type NavItem = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  ariaLabel?: string;
  hotkey?: string;
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/portal", icon: Home, ariaLabel: "Member dashboard" },
  { label: "Vehicles", href: "/portal/vehicles", icon: CarFront, ariaLabel: "My vehicles" },
  { label: "Access", href: "/portal/access", icon: KeyRound, ariaLabel: "Gate & storage access" },
  { label: "Profile", href: "/portal/profile", icon: UserRound, ariaLabel: "Profile & membership" },
];

export const MobileNav = () => {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="mobile-nav-blur fixed inset-x-0 bottom-0 z-40 border-t border-[rgba(var(--border-rgb),0.45)] bg-[rgba(var(--bg-rgb),0.68)] backdrop-blur-2xl md:hidden"
      style={{ paddingBottom: `max(env(safe-area-inset-bottom), 0.5rem)` }}
    >
      <div className="mx-auto flex w-full max-w-xl items-center justify-around px-3 py-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "relative flex flex-1 flex-col items-center gap-1 rounded-3xl px-2 py-1 text-[0.78rem] font-semibold tracking-wide text-[rgba(var(--text-rgb),0.55)] transition",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--blue)]",
                isActive && "text-[var(--text)]"
              )}
              aria-label={item.ariaLabel ?? item.label}
              aria-current={isActive ? "page" : undefined}
            >
              <span
                className={clsx(
                  "flex h-11 w-full min-w-[3.25rem] items-center justify-center rounded-2xl border border-transparent text-[rgba(var(--text-rgb),0.8)]",
                  isActive &&
                    "border-[rgba(var(--blue-rgb),0.6)] bg-[rgba(var(--blue-rgb),0.12)] text-[var(--text)] shadow-[0_12px_30px_rgba(6,16,25,0.55)]"
                )}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="leading-none">{item.label}</span>
              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute -top-1 h-1.5 w-10 rounded-full bg-gradient-to-r from-[var(--blue)] to-[rgba(var(--blue-rgb),0.65)]"
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
