"use client";

import Link from "next/link";
import { useGetAgencyInfoQuery } from "@/store/api/agencyApi";

function WhatsAppIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.86 9.86 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.13h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.36c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.7 8.21-8.23 8.21zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.42l-.47-.01c-.17 0-.43.06-.66.31-.23.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.17-.47-.29z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M16.5 3c.3 2.05 1.46 3.66 3.5 3.94v2.43c-1.18.12-2.21-.27-3.42-1v5.27c0 6.7-7.3 8.79-10.24 3.99-1.89-3.09-.73-8.51 5.33-8.73v2.56c-.46.08-.96.19-1.42.34-1.36.46-2.13 1.32-1.92 2.84.41 2.91 5.74 3.77 5.3-1.95V3h2.88z" />
    </svg>
  );
}

const portalLinks = [
  { label: "LOGIN", href: "/auth" },
  { label: "CREATE ACCOUNT", href: "/auth" },
];

export function Footer() {
  const { data: agency } = useGetAgencyInfoQuery();

  // Fallback dipakai hanya selama request /api/agency masih jalan — jangan "#",
  // supaya tautan tidak pernah mati kalau user mengklik lebih dulu.
  const waNumber = agency?.contact.whatsapp.number ?? "6281233407992";
  const waLabel = agency?.contact.whatsapp.displayLabel ?? "+62 812-3340-7992";
  const waHref = `https://wa.me/${waNumber}`;
  const igHandle = agency?.contact.instagram.handle ?? "@portal.management";
  const igHref =
    agency?.contact.instagram.url ??
    "https://www.instagram.com/portal.management";
  const ttHandle = agency?.contact.tiktok.handle ?? "@portal.management";
  const ttHref =
    agency?.contact.tiktok.url ?? "https://www.tiktok.com/@portal.management";
  const locationLine = agency
    ? `${agency.location.city}, ${agency.location.country}`
    : "Semarang, Indonesia";
  const brandLine = agency?.name ?? "PORTAL MANAGEMENT";

  const socials = [
    { name: "WhatsApp", href: waHref, handle: waLabel, icon: <WhatsAppIcon /> },
    { name: "Instagram", href: igHref, handle: igHandle, icon: <InstagramIcon /> },
    { name: "TikTok", href: ttHref, handle: ttHandle, icon: <TikTokIcon /> },
  ];

  return (
    <footer className="w-full py-section px-margin-mobile md:px-margin-desktop bg-background border-t-2 border-accent">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
        <div className="md:col-span-4 flex flex-col gap-8">
          <Link
            href="/"
            className="font-display text-headline-md text-primary uppercase inline-flex items-center gap-3 w-fit hover:text-accent transition-colors"
          >
            <span className="inline-block h-2 w-2 bg-accent" aria-hidden="true" />
            {brandLine}
          </Link>
          <div className="flex flex-col gap-2 text-caption text-secondary uppercase tracking-[0.1em]">
            <span>{locationLine}</span>
            <span>© 2026 Portal Management. All rights reserved.</span>
          </div>
        </div>

        <nav className="md:col-span-3 flex flex-col gap-5 text-caption">
          <p className="text-label-uppercase text-primary uppercase flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 bg-accent" aria-hidden="true" />
            CONTACT
          </p>
          <div className="flex items-center gap-3">
            {socials.map((s) => (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${s.name} · ${s.handle}`}
                title={`${s.name} · ${s.handle}`}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-outline-variant text-primary hover:border-accent hover:text-accent transition-colors"
              >
                {s.icon}
              </a>
            ))}
          </div>
          <span className="text-secondary uppercase tracking-[0.1em]">
            {waLabel}
          </span>
        </nav>

        <nav className="md:col-span-3 md:col-start-10 flex flex-col gap-4 text-caption md:items-end">
          <p className="text-label-uppercase text-primary uppercase mb-2 flex items-center gap-2 md:flex-row-reverse">
            <span className="inline-block h-1.5 w-1.5 bg-accent" aria-hidden="true" />
            PORTAL
          </p>
          {portalLinks.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="text-secondary hover:text-accent hover:decoration-accent underline decoration-1 underline-offset-4 transition-colors uppercase"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
