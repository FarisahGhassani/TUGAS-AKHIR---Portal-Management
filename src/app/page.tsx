"use client";

import { useEffect } from "react";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/landing/Hero";
import { Capabilities } from "@/components/landing/Capabilities";
import { Announcements } from "@/components/landing/Announcements";
import { CTASection } from "@/components/landing/CTASection";
import { useGetLandingQuery } from "@/store/api/landingApi";

export default function HomePage() {
  const { data, isLoading, isError } = useGetLandingQuery();

  // When arriving with a hash (e.g. /#essence from another page), scroll to the
  // target once the content has actually rendered.
  useEffect(() => {
    if (!data) return;
    const id = window.location.hash.slice(1);
    if (!id) return;
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView();
    });
  }, [data]);

  if (isLoading || !data) {
    return (
      <>
        <NavBar />
        <main className="min-h-[60vh] flex items-center justify-center">
          <p className="text-label-uppercase text-on-surface-variant uppercase">
            Loading…
          </p>
        </main>
        <Footer />
      </>
    );
  }

  if (isError) {
    return (
      <>
        <NavBar />
        <main className="min-h-[60vh] flex items-center justify-center">
          <p className="text-label-uppercase text-error uppercase">
            Failed to load content.
          </p>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      {/* Landing nav floats over the hero wordmark rather than sitting as a top
          bar, see NavBar's `overlay` variant. */}
      <NavBar overlay />
      <main>
        <Hero data={data.hero} />
        <Announcements />
        <Capabilities essence={data.essence} capabilities={data.capabilities} />
        <CTASection data={data.cta} />
      </main>
      <Footer />
    </>
  );
}
