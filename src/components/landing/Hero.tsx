"use client";

import Image from "next/image";
import type { LandingContent } from "@/store/api/landingApi";
import { useAppSelector } from "@/store/hooks";

type Props = {
  data: LandingContent["hero"];
  essence: LandingContent["essence"];
};

export function Hero({ data, essence }: Props) {
  const marqueeItems = useAppSelector((s) => s.ui.marqueeItems);
  const loop = [...marqueeItems, ...marqueeItems, ...marqueeItems];

  return (
    <section className="w-full pt-4 md:pt-6">
      {/* Giant wordmark — single line, edge-to-edge */}
      <h1
        className="font-display text-primary uppercase leading-[0.85] tracking-[-0.04em] font-bold px-margin-mobile md:px-margin-desktop"
        style={{ fontSize: "clamp(75px, 22vw, 320px)" }}
      >
        PORTAL
      </h1>

      {/* Marquee strip — bullet-separated, infinite scroll, driven by RTK slice */}
      <div className="relative w-full overflow-hidden mt-2 md:mt-4">
        <div className="marquee-track flex w-max whitespace-nowrap will-change-transform py-2 md:py-3">
          {loop.map((item, i) => (
            <span
              key={`${item}-${i}`}
              className="flex items-center text-label-uppercase md:text-caption text-primary uppercase tracking-[0.15em]"
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

      {/* Editorial split: essence copy (about) left, image right */}
      <div
        id="essence"
        className="grid grid-cols-1 md:grid-cols-12 gap-gutter px-margin-mobile md:px-margin-desktop mt-12 md:mt-20 scroll-mt-24"
      >
        <div className="md:col-span-5 flex flex-col justify-end pb-6">
          <p className="text-label-uppercase text-secondary mb-6 uppercase">
            {essence.eyebrow}
          </p>
          <p className="text-body-lg text-on-surface max-w-prose">
            {essence.body}
          </p>
        </div>

        <div className="md:col-span-7 relative aspect-[4/5] md:aspect-[5/6] w-full overflow-hidden">
          <Image
            src={data.image}
            alt={data.imageAlt}
            fill
            priority
            sizes="(min-width: 768px) 58vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
