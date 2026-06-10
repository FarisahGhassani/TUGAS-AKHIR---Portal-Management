"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Footer } from "@/components/Footer";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setActiveMenu } from "@/store/slices/uiSlice";

export type DashboardNavSection = {
  heading: string;
  items: { label: string; href: string; icon?: React.ReactNode }[];
};

type Props = {
  children: React.ReactNode;
  brandHref?: string;
  title?: string;
  description?: string;
  sections: DashboardNavSection[];
  footerItems?: { label: string; href: string; icon?: React.ReactNode }[];
};

export function DashboardShell({
  children,
  brandHref = "/",
  title = "PORTAL",
  description = "MANAGEMENT DASHBOARD",
  sections,
  footerItems,
}: Props) {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const activeMenu = useAppSelector((s) => s.ui.activeMenu);
  const marqueeItems = useAppSelector((s) => s.ui.marqueeItems);
  const marqueeLoop = [...marqueeItems, ...marqueeItems, ...marqueeItems];
  const [mobileOpen, setMobileOpen] = useState(false);

  const flatItems = sections.flatMap((s) => s.items);

  function isActive(href: string) {
    if (href === pathname) return true;
    if (href !== "/" && pathname?.startsWith(href)) return true;
    return false;
  }

  useEffect(() => {
    const match = flatItems.find((i) => isActive(i.href));
    if (match && match.label !== activeMenu) {
      dispatch(setActiveMenu(match.label));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Editorial header: huge title left, sign-out / avatar right */}
      <header className="w-full px-margin-mobile md:px-margin-desktop pt-margin-tablet md:pt-margin-desktop">
        <div className="flex items-start justify-between gap-gutter">
          <Link
            href={brandHref}
            className="font-display text-headline-lg-mobile md:text-headline-lg text-primary uppercase leading-none tracking-tight"
          >
            {title}
          </Link>

          <div className="flex items-center gap-6">
            <Link
              href="/auth"
              className="text-label-uppercase text-secondary hover:text-primary transition-colors uppercase hidden sm:inline"
            >
              SIGN OUT
            </Link>
            <div
              aria-hidden="true"
              className="w-10 h-10 bg-surface-container-high border border-outline-variant flex items-center justify-center text-label-uppercase text-primary uppercase"
            >
              SV
            </div>
          </div>
        </div>

        {/* Static subtitle (small caps) under the big title */}
        <p className="mt-2 text-label-uppercase text-secondary uppercase">
          {description}
        </p>
      </header>

      {/* Running marquee strip (RTK-driven) */}
      <div className="relative w-full overflow-hidden mt-6 md:mt-8 border-y border-outline-variant">
        <div className="marquee-track flex w-max whitespace-nowrap will-change-transform py-3">
          {marqueeLoop.map((item, i) => (
            <span
              key={`${item}-${i}`}
              className="flex items-center text-label-uppercase text-primary uppercase tracking-[0.15em]"
              aria-hidden={i >= marqueeItems.length}
            >
              <span
                className="inline-block w-1.5 h-1.5 bg-primary mx-6 md:mx-10"
                aria-hidden="true"
              />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Simple horizontal menu — single line, minimal */}
      <nav
        aria-label="Dashboard primary"
        className="w-full px-margin-mobile md:px-margin-desktop mt-6 md:mt-8 border-b border-outline-variant"
      >
        <div className="hidden md:flex items-center gap-margin-tablet overflow-x-auto">
          {flatItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => dispatch(setActiveMenu(item.label))}
                className={`text-label-uppercase uppercase py-4 transition-colors border-b ${
                  active
                    ? "text-primary border-primary"
                    : "text-secondary border-transparent hover:text-primary"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          {footerItems?.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => dispatch(setActiveMenu(item.label))}
                className={`ml-auto text-label-uppercase uppercase py-4 transition-colors border-b ${
                  active
                    ? "text-primary border-primary"
                    : "text-secondary border-transparent hover:text-primary"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Mobile toggle */}
        <div className="md:hidden flex items-center justify-between py-4">
          <span className="text-label-uppercase text-secondary uppercase">
            {activeMenu || "MENU"}
          </span>
          <button
            type="button"
            className="text-primary hover:opacity-70 transition-opacity"
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              {mobileOpen ? (
                <path strokeLinecap="square" d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path strokeLinecap="square" d="M4 8h16M4 16h16" />
              )}
            </svg>
          </button>
        </div>

        {mobileOpen && (
          <ul className="md:hidden flex flex-col gap-1 pb-4">
            {[...flatItems, ...(footerItems ?? [])].map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    onClick={() => {
                      dispatch(setActiveMenu(item.label));
                      setMobileOpen(false);
                    }}
                    className={`block text-label-uppercase uppercase py-3 ${
                      active ? "text-primary" : "text-secondary"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </nav>

      <main className="flex-1 w-full max-w-editorial mx-auto px-margin-mobile py-margin-tablet md:px-margin-desktop md:py-margin-desktop">
        {children}
      </main>

      <Footer />
    </div>
  );
}
