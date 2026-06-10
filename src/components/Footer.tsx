"use client";

import Link from "next/link";
import { useGetAgencyInfoQuery } from "@/store/api/agencyApi";

const policyLinks = [
  { label: "PRIVACY POLICY", href: "/privacy" },
  { label: "TERMS OF SERVICE", href: "/terms" },
];

const portalLinks = [
  { label: "LOGIN", href: "/auth" },
  { label: "CREATE ACCOUNT", href: "/auth" },
];

export function Footer() {
  const { data: agency } = useGetAgencyInfoQuery();

  const waNumber = agency?.contact.whatsapp.number;
  const waLabel = agency?.contact.whatsapp.displayLabel ?? "+62 812-3340-7992";
  const waHref = waNumber ? `https://wa.me/${waNumber}` : "#";
  const igHandle = agency?.contact.instagram.handle ?? "@portal.management";
  const igHref =
    agency?.contact.instagram.url ??
    "https://www.instagram.com/portal.management";
  const locationLine = agency
    ? `${agency.location.city}, ${agency.location.country}`
    : "Semarang, Indonesia";
  const brandLine = agency?.name ?? "PORTAL MANAGEMENT";

  return (
    <footer className="w-full py-section px-margin-mobile md:px-margin-desktop bg-background border-t border-outline-variant">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
        <div className="md:col-span-4 flex flex-col gap-8">
          <Link
            href="/"
            className="font-display text-headline-md text-primary uppercase block"
          >
            {brandLine}
          </Link>
          <div className="flex flex-col gap-2 text-caption text-secondary uppercase tracking-[0.1em]">
            <span>{locationLine}</span>
            <span>© 2026 Portal Management. All rights reserved.</span>
          </div>
        </div>

        <nav className="md:col-span-3 flex flex-col gap-4 text-caption">
          <p className="text-label-uppercase text-primary uppercase mb-2">
            CONTACT
          </p>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-secondary hover:text-primary underline decoration-1 underline-offset-4 transition-colors"
          >
            WhatsApp · {waLabel}
          </a>
          <a
            href={igHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-secondary hover:text-primary underline decoration-1 underline-offset-4 transition-colors"
          >
            Instagram · {igHandle}
          </a>
        </nav>

        <nav className="md:col-span-2 flex flex-col gap-4 text-caption">
          <p className="text-label-uppercase text-primary uppercase mb-2">
            PORTAL
          </p>
          {portalLinks.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="text-secondary hover:text-primary underline decoration-1 underline-offset-4 transition-colors uppercase"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <nav className="md:col-span-3 flex flex-col gap-4 text-caption md:items-end">
          <p className="text-label-uppercase text-primary uppercase mb-2">
            LEGAL
          </p>
          {policyLinks.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="text-secondary hover:text-primary underline decoration-1 underline-offset-4 transition-colors uppercase"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
