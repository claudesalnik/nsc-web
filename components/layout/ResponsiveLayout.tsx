"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import clsx from "clsx";

import { MobileNav } from "./MobileNav";

const DESKTOP_BREAKPOINT = 1024; // matches Tailwind's `lg`

type ResponsiveLayoutProps = {
  children: ReactNode;
  mobileHeader?: ReactNode;
  desktopSidebar?: ReactNode;
  desktopHeader?: ReactNode;
  showMobileNav?: boolean;
  className?: string;
  contentClassName?: string;
};

export const ResponsiveLayout = ({
  children,
  mobileHeader,
  desktopSidebar,
  desktopHeader,
  showMobileNav = true,
  className,
  contentClassName,
}: ResponsiveLayoutProps) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const query = window.matchMedia(`(max-width: ${DESKTOP_BREAKPOINT - 1}px)`);
    const update = (event: MediaQueryList | MediaQueryListEvent) => setIsMobile(event.matches);

    update(query);

    if (typeof query.addEventListener === "function") {
      const listener = (event: MediaQueryListEvent) => update(event);
      query.addEventListener("change", listener);
      return () => query.removeEventListener("change", listener);
    }

    const legacyListener = (event: MediaQueryListEvent) => update(event);
    query.addListener(legacyListener);
    return () => query.removeListener(legacyListener);
  }, []);

  const mobileContentPadding = useMemo(
    () => ({
      paddingBottom: `calc(4.5rem + var(--safe-area-bottom))`,
    }),
    []
  );

  if (isMobile) {
    return (
      <div className={clsx("mobile-shell", className)}>
        {mobileHeader && <div className="mobile-safe-area-pad">{mobileHeader}</div>}
        <div className={clsx("mobile-content", contentClassName)} style={mobileContentPadding}>
          {children}
        </div>
        {showMobileNav && <MobileNav />}
      </div>
    );
  }

  return (
    <div className={clsx("flex min-h-screen bg-[var(--bg)] text-[var(--text)]", className)}>
      {desktopSidebar && (
        <aside className="hidden lg:flex lg:w-72 xl:w-80 lg:flex-col lg:border-r lg:border-[rgba(var(--border-rgb),0.35)] lg:bg-[var(--surface2)]">
          {desktopSidebar}
        </aside>
      )}
      <main className="flex-1">
        {desktopHeader && (
          <div className="sticky top-0 z-30 border-b border-[rgba(var(--border-rgb),0.35)] bg-[rgba(var(--bg-rgb),0.85)]/90 px-10 py-6 backdrop-blur-xl">
            {desktopHeader}
          </div>
        )}
        <div className={clsx("px-4 py-6 sm:px-8 lg:px-12 lg:py-10", contentClassName)}>{children}</div>
      </main>
    </div>
  );
};
