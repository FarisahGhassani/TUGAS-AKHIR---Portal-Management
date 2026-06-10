"use client";

import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { PortfolioGallery } from "@/components/talent/PortfolioGallery";
import {
  useGetTalentBySlugQuery,
  type TalentMeasurement,
  type TalentWorkCategory,
} from "@/store/api/talentApi";

const measurementOrder: {
  key: keyof TalentMeasurement;
  label: string;
  suffix?: string;
}[] = [
  { key: "tinggiBadan", label: "HEIGHT", suffix: " CM" },
  { key: "beratBadan", label: "WEIGHT", suffix: " KG" },
  { key: "sizeBaju", label: "CLOTHING SIZE" },
  { key: "sizeSepatu", label: "SHOE SIZE" },
];

const categoryLabel: Record<TalentWorkCategory, string> = {
  photoshoot: "PHOTOSHOOT",
  runway: "RUNWAY",
  tvc: "TVC",
  commercial: "COMMERCIAL",
  "muse-beauty": "MUSE / BEAUTY",
};

export default function TalentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { data: talent, isFetching, isError } = useGetTalentBySlugQuery(slug);

  if (isFetching && !talent) {
    return (
      <>
        <NavBar />
        <main className="min-h-[60vh] flex items-center justify-center">
          <p className="text-label-uppercase text-on-surface-variant uppercase">
            Loading profile…
          </p>
        </main>
        <Footer />
      </>
    );
  }

  if (isError || !talent) {
    return (
      <>
        <NavBar />
        <main className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-margin-mobile md:px-margin-desktop">
          <p className="text-label-uppercase text-error uppercase">
            Talent not found.
          </p>
          <Link
            href="/talent"
            className="text-label-uppercase text-primary border border-primary px-8 py-4 hover:bg-primary hover:text-on-primary transition-colors uppercase"
          >
            BACK TO ROSTER
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <NavBar />
      <main className="w-full max-w-editorial mx-auto pb-section">
        <section className="grid grid-cols-1 md:grid-cols-12 gap-gutter md:gap-12 px-margin-mobile md:px-margin-desktop pt-10 md:pt-16 pb-section">
          {/* Composite card (left) — comp card: photo + name + stats */}
          <div className="md:col-span-5">
            <div className="border border-outline-variant md:sticky md:top-24">
              <div className="relative aspect-[4/5] w-full">
                <Image
                  src={talent.cover}
                  alt={talent.coverAlt}
                  fill
                  priority
                  sizes="(min-width: 768px) 42vw, 100vw"
                  className="object-cover object-top grayscale"
                />
              </div>
              <div className="p-6 border-t border-outline-variant">
                <p className="font-display text-headline-md text-primary uppercase leading-none">
                  {talent.name}
                </p>
                <p className="text-label-uppercase text-secondary uppercase mt-2">
                  {talent.gender}
                </p>
                <div className="grid grid-cols-2 gap-y-5 gap-x-4 border-t border-outline-variant mt-6 pt-6">
                  {measurementOrder.map(({ key, label, suffix }) => (
                    <div key={key}>
                      <p className="text-label-uppercase text-secondary mb-1.5 uppercase">
                        {label}
                      </p>
                      <p className="text-body-md text-primary">
                        {talent.measurements[key]}
                        {suffix ?? ""}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Description (right) */}
          <div className="md:col-span-7 flex flex-col justify-center pt-8 md:pt-0">
            <p className="text-label-uppercase text-secondary uppercase mb-4">
              TALENT PROFILE
            </p>
            <h1 className="font-display text-headline-lg-mobile md:text-headline-lg text-primary uppercase leading-[1.05]">
              {talent.name.split(" ").map((part, i) => (
                <span key={i} className="block">
                  {part}
                </span>
              ))}
            </h1>
            <div className="flex flex-wrap gap-3 mt-8">
              {talent.categories.map((c) => (
                <span
                  key={c}
                  className="text-label-uppercase text-primary uppercase border border-outline-variant px-3 py-1.5"
                >
                  {categoryLabel[c]}
                </span>
              ))}
            </div>
            <p className="text-body-lg text-secondary max-w-prose mt-8">
              {talent.bio}
            </p>
          </div>
        </section>

        {/* Portfolio — works posted by the agency for this talent */}
        <PortfolioGallery items={talent.portfolio} />

        <section className="px-margin-mobile md:px-margin-desktop py-24 bg-surface-container-low text-center">
          <h3 className="font-display text-headline-md text-primary mb-8 max-w-2xl mx-auto uppercase">
            INTERESTED IN BOOKING {talent.name.split(" ")[0]} FOR YOUR NEXT
            CAMPAIGN?
          </h3>
          <Link
            href="/auth"
            className="inline-block text-label-uppercase bg-primary text-on-primary px-12 py-5 hover:opacity-70 transition-opacity uppercase"
          >
            INQUIRE ABOUT THIS TALENT
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
