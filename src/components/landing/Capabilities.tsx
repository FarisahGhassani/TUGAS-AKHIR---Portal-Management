import Image from "next/image";
import Link from "next/link";
import type { LandingContent } from "@/store/api/landingApi";

/**
 * Unified "About" (essence) + Capabilities block.
 * The essence intro pairs editorial copy with a portrait image, then the
 * capabilities sit below as a numbered index — the figures carry the rhythm
 * instead of repeated hairlines, keeping it minimal but not flat. Anchored
 * with id="essence" for the ABOUT nav.
 */
export function Capabilities({
  essence,
  capabilities,
}: {
  essence: LandingContent["essence"];
  capabilities: LandingContent["capabilities"];
}) {
  return (
    <section
      id="essence"
      className="py-section px-margin-mobile md:px-margin-desktop bg-surface-container-low scroll-mt-24"
    >
      <div className="max-w-editorial mx-auto">
        {/* About / Essence — copy + editorial portrait */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter items-center">
          <div className="md:col-span-7 flex flex-col gap-6">
            <p className="text-label-uppercase text-secondary uppercase">
              {essence.eyebrow}
            </p>
            <p className="text-headline-lg-mobile md:text-headline-md text-primary max-w-prose leading-[1.25]">
              {essence.body}
            </p>
            <Link
              href="/talent"
              className="group inline-flex items-center gap-3 self-start text-label-uppercase text-primary uppercase hover:gap-4 hover:text-accent transition-all"
            >
              {essence.ctaLabel}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <path strokeLinecap="square" d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          </div>

          <div className="md:col-span-5 relative aspect-[4/5] w-full overflow-hidden group">
            <Image
              src={essence.image}
              alt={essence.imageAlt}
              fill
              sizes="(min-width: 768px) 40vw, 100vw"
              className="object-cover group-hover:grayscale transition-all duration-700"
            />
          </div>
        </div>

        {/* Capabilities — numbered editorial index, no repeated hairlines */}
        <div className="mt-10 md:mt-12">
          <p className="text-label-uppercase text-secondary uppercase mb-6 md:mb-8">
            {capabilities.eyebrow}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-gutter gap-y-8 md:gap-y-10">
            {capabilities.items.map((item, index) => (
              <div key={item.title} className="group/cap flex flex-col gap-4">
                <span
                  aria-hidden="true"
                  className="font-display text-headline-md leading-none text-outline-variant group-hover/cap:text-accent transition-colors"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="text-label-uppercase text-primary uppercase">
                  {item.title}
                </h3>
                <p className="text-body-md text-secondary">
                  {item.description}
                </p>
                <Link
                  href="/services"
                  className="mt-1 text-caption text-primary hover:text-accent transition-colors uppercase"
                >
                  LEARN MORE
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
