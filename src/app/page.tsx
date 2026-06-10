"use client";

import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/landing/Hero";
import { Capabilities } from "@/components/landing/Capabilities";
import { Announcements } from "@/components/landing/Announcements";
import { CTASection } from "@/components/landing/CTASection";
import { useGetLandingQuery } from "@/store/api/landingApi";

export default function HomePage() {
  const { data, isLoading, isError } = useGetLandingQuery();

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
      <NavBar />
      <main>
        <Hero data={data.hero} essence={data.essence} />
        <Capabilities data={data.capabilities} />
        <Announcements />
        <CTASection data={data.cta} />
      </main>
      <Footer />
    </>
  );
}
