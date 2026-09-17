"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LogoutButton } from "@/components/auth/LogoutButton";
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
  description = "MANAGEMENT",
  sections,
  footerItems,
}: Props) {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const activeMenu = useAppSelector((s) => s.ui.activeMenu);
  const user = useAppSelector((s) => s.auth.user);
  const [mobileOpen, setMobileOpen] = useState(false);

  const flatItems = sections.flatMap((s) => s.items);

  // Inisial dari nama akun yang sedang login (mis. "Sasha Vega" → "SV").
  const initials = user?.name
    ? user.name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("")
    : "PM";

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

  // Isi sidebar dipakai dua kali: kolom tetap (md+) dan drawer (mobile).
  const navTree = (
    <nav aria-label="Dashboard" className="flex flex-col gap-8">
      {sections.map((section) => (
        <div key={section.heading} className="flex flex-col gap-1">
          <p className="text-label-uppercase text-on-surface-variant uppercase px-3 mb-2">
            {section.heading}
          </p>
          {section.items.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => {
                  dispatch(setActiveMenu(item.label));
                  setMobileOpen(false);
                }}
                className={`group flex items-center gap-3 border-l-2 pl-3 pr-2 py-2.5 text-label-uppercase uppercase transition-colors ${
                  active
                    ? "border-accent text-primary bg-surface-container-low"
                    : "border-transparent text-secondary hover:text-primary hover:border-outline-variant"
                }`}
              >
                {item.icon && (
                  <span
                    className={
                      active ? "text-accent" : "text-secondary group-hover:text-primary"
                    }
                  >
                    {item.icon}
                  </span>
                )}
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );

  const navFooter = (
    <div className="flex flex-col gap-1 border-t border-outline-variant pt-5">
      {footerItems?.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.label}
            href={item.href}
            onClick={() => {
              dispatch(setActiveMenu(item.label));
              setMobileOpen(false);
            }}
            className={`flex items-center gap-3 border-l-2 pl-3 pr-2 py-2.5 text-label-uppercase uppercase transition-colors ${
              active
                ? "border-accent text-primary"
                : "border-transparent text-secondary hover:text-primary"
            }`}
          >
            {item.icon && <span>{item.icon}</span>}
            {item.label}
          </Link>
        );
      })}
      <LogoutButton
        label="LOGOUT"
        onClick={() => setMobileOpen(false)}
        className="flex items-center gap-3 border-l-2 border-transparent pl-3 pr-2 py-2.5 text-label-uppercase uppercase text-secondary hover:text-accent transition-colors text-left"
      />
    </div>
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar tetap (md+) — klasifikasi per kepentingan pengelolaan. */}
      <aside className="hidden md:flex md:w-64 lg:w-72 shrink-0 flex-col border-r border-outline-variant sticky top-0 h-screen">
        <Link
          href={brandHref}
          className="block px-6 pt-8 pb-6 border-b border-outline-variant"
        >
          <span className="font-display text-headline-md text-primary uppercase leading-none tracking-tight">
            {title}
          </span>
          <span className="block mt-2 text-label-uppercase text-on-surface-variant uppercase">
            {description}
          </span>
        </Link>

        <div className="flex-1 overflow-y-auto px-3 py-6">{navTree}</div>

        <div className="px-3 pb-6">
          {navFooter}
          <div className="flex items-center gap-3 px-3 pt-5">
            <div
              aria-hidden="true"
              className="w-9 h-9 bg-surface-container-high border border-outline-variant flex items-center justify-center text-label-uppercase text-primary uppercase shrink-0"
            >
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-caption text-primary truncate">{user?.name}</p>
              <p className="text-label-uppercase text-on-surface-variant uppercase truncate">
                {user?.role}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Kolom konten */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar mobile — brand + hamburger. */}
        <header className="md:hidden flex items-center justify-between px-margin-mobile py-4 border-b border-outline-variant">
          <Link
            href={brandHref}
            className="font-display text-headline-md text-primary uppercase leading-none"
          >
            {title}
          </Link>
          <button
            type="button"
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="text-primary hover:opacity-70 transition-opacity"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
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
        </header>

        {/* Drawer mobile */}
        {mobileOpen && (
          <div
            className="md:hidden fixed inset-0 z-50 bg-primary/40"
            onClick={() => setMobileOpen(false)}
          >
            <div
              className="absolute left-0 top-0 h-full w-72 max-w-[85%] bg-background border-r border-outline-variant flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 pt-8 pb-6 border-b border-outline-variant">
                <span className="font-display text-headline-md text-primary uppercase leading-none">
                  {title}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto px-3 py-6">{navTree}</div>
              <div className="px-3 pb-6">{navFooter}</div>
            </div>
          </div>
        )}

        <main className="flex-1 w-full max-w-editorial mx-auto px-margin-mobile py-6 md:px-margin-desktop md:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
