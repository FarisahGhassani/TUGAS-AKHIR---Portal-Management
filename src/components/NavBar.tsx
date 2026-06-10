"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setActiveMenu } from "@/store/slices/uiSlice";

const navItems = [
  { label: "ABOUT", href: "/#essence" },
  { label: "TALENTS", href: "/talent" },
  { label: "PROJECTS", href: "/projects" },
  { label: "APPLY", href: "/auth" },
];

export function NavBar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const activeMenu = useAppSelector((s) => s.ui.activeMenu);

  function isActive(href: string, label: string) {
    if (activeMenu === label) return true;
    if (href === pathname) return true;
    if (href !== "/" && pathname?.startsWith(href)) return true;
    return false;
  }

  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md">
      <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop h-20">
        <Link
          href="/"
          className="font-display text-headline-md tracking-tight text-primary uppercase hover:opacity-70 transition-opacity"
        >
          PORTAL MANAGEMENT
        </Link>

        <nav className="hidden md:flex gap-8 items-center text-label-uppercase">
          {navItems.map((item) => {
            const active = isActive(item.href, item.label);
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => dispatch(setActiveMenu(item.label))}
                className={`uppercase transition-colors ${
                  active
                    ? "text-primary border-b border-primary pb-1"
                    : "text-secondary hover:text-primary"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex gap-6 items-center text-label-uppercase">
          <Link
            href="/auth"
            className="uppercase text-secondary hover:text-primary transition-colors"
          >
            LOGIN
          </Link>
          <Link
            href="/collaboration"
            className="uppercase text-on-primary bg-primary px-5 py-3 hover:opacity-80 transition-opacity"
          >
            LET&apos;S COLLABORATION
          </Link>
        </div>

        <button
          aria-label="Toggle menu"
          className="md:hidden text-primary"
          onClick={() => setMobileOpen((v) => !v)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            {mobileOpen ? (
              <path strokeLinecap="square" d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path strokeLinecap="square" d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-outline-variant bg-background px-margin-mobile py-6 flex flex-col gap-5 text-label-uppercase">
          {navItems.map((item) => {
            const active = isActive(item.href, item.label);
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => {
                  dispatch(setActiveMenu(item.label));
                  setMobileOpen(false);
                }}
                className={`uppercase ${
                  active ? "text-primary" : "text-secondary"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <div className="border-t border-outline-variant pt-5 flex flex-col gap-5">
            <Link
              href="/auth"
              onClick={() => setMobileOpen(false)}
              className="uppercase text-secondary"
            >
              LOGIN
            </Link>
            <Link
              href="/collaboration"
              onClick={() => setMobileOpen(false)}
              className="uppercase text-on-primary bg-primary py-3 text-center"
            >
              LET&apos;S COLLABORATION
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
