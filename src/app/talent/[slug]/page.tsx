"use client";

import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { PortfolioGallery } from "@/components/talent/PortfolioGallery";
import { useAppDispatch } from "@/store/hooks";
import { setInquiryTalent } from "@/store/slices/uiSlice";
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
  const dispatch = useAppDispatch();
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
        <section className="grid grid-cols-1 md:grid-cols-12 gap-gutter md:gap-12 px-margin-mobile md:px-margin-desktop pt-6 md:pt-8 pb-12">
          {/* Composite card (left) — comp card: photo + name + stats */}
          <div className="md:col-span-5">
            <div className="border border-outline-variant md:sticky md:top-24">
              {/* Portrait capped to viewport height so the full comp card
                  (photo + name + measurements) lands in one screen instead of
                  a 700px image pushing the stats below the fold. */}
              <div className="relative h-[44vh] md:h-[52vh] w-full">
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
            {/* Primary action lives in the hero so the right column reads as a
                complete unit (no hollow space) and the key client action is
                above the fold. Talent name carried to /collaboration via RTK. */}
            <Link
              href="/collaboration"
              onClick={() => dispatch(setInquiryTalent(talent.name))}
              className="mt-10 inline-block self-start text-label-uppercase bg-primary text-on-primary px-10 py-4 hover:bg-accent transition-colors uppercase"
            >
              INQUIRE ABOUT THIS TALENT
            </Link>
          </div>
        </section>

        {/* Portfolio — works posted by the agency for this talent */}
        <PortfolioGallery items={talent.portfolio} />

        <section className="px-margin-mobile md:px-margin-desktop py-12 bg-surface-container-low text-center">
          <h3 className="font-display text-headline-md text-primary mb-6 max-w-2xl mx-auto uppercase">
            INTERESTED IN BOOKING {talent.name.split(" ")[0]} FOR YOUR NEXT
            CAMPAIGN?
          </h3>
          {/* Inquiry adalah aksi khusus client → arahkan ke halaman client-only
              /collaboration. RoleGate di sana yang menyaring: client lanjut ke
              form, selain itu diarahkan login/daftar sebagai client. Nama talent
              dibawa lewat RTK supaya field "preferred model" otomatis terisi. */}
          <Link
            href="/collaboration"
            onClick={() => dispatch(setInquiryTalent(talent.name))}
            className="inline-block text-label-uppercase bg-primary text-on-primary px-12 py-5 hover:bg-accent transition-colors uppercase"
          >
            INQUIRE ABOUT THIS TALENT
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
