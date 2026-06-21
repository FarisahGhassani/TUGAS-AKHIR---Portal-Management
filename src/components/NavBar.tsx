"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setActiveMenu } from "@/store/slices/uiSlice";

const navItems = [
  { label: "ABOUT", href: "/#essence" },
  { label: "TALENTS", href: "/talent" },
  { label: "PROJECTS", href: "/projects" },
  { label: "APPLY", href: "/dashboard" },
];

export function NavBar({ overlay = false }: { overlay?: boolean } = {}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const activeMenu = useAppSelector((s) => s.ui.activeMenu);
  const isLoggedIn = useAppSelector((s) => s.auth.user !== null);

  function isActive(href: string, label: string) {
    if (activeMenu === label) return true;
    if (href === pathname) return true;
    if (href !== "/" && pathname?.startsWith(href)) return true;
    return false;
  }

  function handleNavClick(
    event: React.MouseEvent<HTMLAnchorElement>,
    item: { label: string; href: string },
  ) {
    dispatch(setActiveMenu(item.label));
    setMobileOpen(false);
    // Same-page hash links (e.g. ABOUT → /#essence): smooth-scroll instead of
    // a navigation so the section comes into view from wherever we are.
    if (item.href.startsWith("/#") && pathname === "/") {
      event.preventDefault();
      const id = item.href.slice(2);
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      window.history.replaceState(null, "", item.href);
    }
  }

  return (
    <header
      className={
        overlay
          ? // Floating over the hero: a smaller, solid white panel centred both
            // horizontally (left-1/2 + translate) and vertically over the giant
            // wordmark. The vertical `top` (set inline) equals half the
            // wordmark's height minus half the bar's height, so it lands on the
            // letters' centre — the word reads above and below the panel.
            "absolute left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-5xl bg-background/50 backdrop-blur-md shadow-sm"
          : "sticky top-0 z-50 bg-background/90 backdrop-blur-md"
      }
      style={
        overlay
          ? { top: "calc((clamp(110px, 24vw, 420px) * 0.82 - 3.5rem) / 2)" }
          : undefined
      }
    >
      <div
        className={`flex justify-between items-center ${
          overlay ? "h-14 px-6 md:px-8" : "h-20 px-margin-mobile md:px-margin-desktop"
        }`}
      >
        <Link
          href="/"
          className={`font-display tracking-tight text-primary uppercase hover:opacity-70 transition-opacity ${
            overlay ? "text-lg md:text-xl" : "text-headline-md"
          }`}
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
                onClick={(e) => handleNavClick(e, item)}
                className={`uppercase transition-colors ${
                  active
                    ? "text-primary border-b-2 border-accent pb-1"
                    : "text-primary hover:text-accent"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex gap-6 items-center text-label-uppercase">
          {isLoggedIn ? (
            <LogoutButton className="uppercase text-primary hover:text-accent transition-colors" />
          ) : (
            <Link
              href="/auth"
              className="uppercase text-primary hover:text-accent transition-colors"
            >
              LOGIN
            </Link>
          )}
          <Link
            href="/collaboration"
            className="uppercase text-on-primary bg-primary px-5 py-3 hover:bg-accent transition-colors"
          >
            LET&apos;S COLLABORATE
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
                onClick={(e) => handleNavClick(e, item)}
                className={`uppercase border-l-2 pl-3 ${
                  active
                    ? "text-primary border-accent"
                    : "text-primary border-transparent"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <div className="border-t border-outline-variant pt-5 flex flex-col gap-5">
            {isLoggedIn ? (
              <LogoutButton
                onClick={() => setMobileOpen(false)}
                className="uppercase text-primary text-left"
              />
            ) : (
              <Link
                href="/auth"
                onClick={() => setMobileOpen(false)}
                className="uppercase text-primary"
              >
                LOGIN
              </Link>
            )}
            <Link
              href="/collaboration"
              onClick={() => setMobileOpen(false)}
              className="uppercase text-on-primary bg-primary py-3 text-center hover:bg-accent transition-colors"
            >
              LET&apos;S COLLABORATE
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
