"use client";

import { useEffect } from "react";
import type { LandingContent } from "@/store/api/landingApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setHeroRevealed } from "@/store/slices/uiSlice";

type Props = {
  data: LandingContent["hero"];
};

const WORDMARK = "PORTAL";

export function Hero({ data }: Props) {
  const dispatch = useAppDispatch();
  const marqueeItems = useAppSelector((s) => s.ui.marqueeItems);
  const heroRevealed = useAppSelector((s) => s.ui.heroRevealed);
  const loop = [...marqueeItems, ...marqueeItems, ...marqueeItems];

  // Trigger the pop-up once the hero mounts (i.e. when the landing page opens,
  // after the RTK Query landing data has resolved). Reset on unmount so the
  // reveal replays the next time the page is visited.
  useEffect(() => {
    const id = requestAnimationFrame(() => dispatch(setHeroRevealed(true)));
    return () => {
      cancelAnimationFrame(id);
      dispatch(setHeroRevealed(false));
    };
  }, [dispatch]);

  return (
    // "Sandwich" hero that fills one screen: giant wordmark on top (the nav bar
    // layers over its crown), a full-bleed image fills the remaining height, and
    // the RTK-driven marquee caps the bottom. On md+ the section tucks up under
    // the sticky nav (-mt-20) so the menu line overlaps the wordmark.
    <section
      className={`relative flex flex-col min-h-[100svh] ${
        heroRevealed ? "hero-revealed" : ""
      }`}
    >
      {/* Top of the sandwich — edge-to-edge wordmark, cropped left/right.
          On md+ its top slips behind the sticky nav (z-50), so the nav/submenu
          line reads as a layer stacked over the word. */}
      <h1
        className="font-display text-primary uppercase font-bold tracking-[-0.04em] leading-[0.82] text-center whitespace-nowrap overflow-hidden shrink-0 pt-2 md:pt-0"
        style={{ fontSize: "clamp(110px, 24vw, 420px)" }}
      >
        <span className="hero-reveal-pop block">{WORDMARK}</span>
      </h1>

      {/* Filling — full-width editorial video grows to take the leftover height
          (object-cover so any aspect ratio fills without distortion). No poster:
          the old landing image used to flash for ~1s before the clip played, so
          the area sits on a neutral surface until the video's first frame
          decodes (preload=auto keeps that near-instant). */}
      <div className="relative w-full flex-1 min-h-0 overflow-hidden group bg-surface-container">
        {/* Purely decorative background clip: no controls, no Picture-in-Picture,
            and pointer-events-none so a click can't pop the browser's PiP/media
            overlay (which briefly showed the frame as if an asset "leaked"). */}
        <video
          src={data.video}
          aria-label={data.imageAlt}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          disablePictureInPicture
          controlsList="nodownload nofullscreen noremoteplayback"
          tabIndex={-1}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
        />
      </div>

      {/* Bottom of the sandwich — bullet-separated marquee, driven by RTK slice */}
      <div className="relative w-full overflow-hidden border-y border-outline-variant shrink-0">
        <div className="marquee-track flex w-max whitespace-nowrap will-change-transform py-2.5 md:py-3">
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
    </section>
  );
}
