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
  { key: "tinggiBadan", label: "HEIGHT", suffix: " Cm" },
  { key: "beratBadan", label: "WEIGHT", suffix: " Kg" },
  { key: "sizeBaju", label: "CLOTHING" },
  { key: "sizeSepatu", label: "SHOE" },
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
          {/* Comp card photo (left) — MAIN asset: BESAR & PENUH, full color,
              TIDAK dipotong (object-contain). Measurement dipindah ke kanan
              supaya foto bisa besar & sisi kanan terisi seimbang. */}
          <div className="md:col-span-5">
            {/* Comp card di-frame 3:4 (object-cover) → ukuran wajar, penuh, tanpa
                bidang abu-abu. Sticky supaya tetap terlihat saat baca kanan. */}
            <div className="relative aspect-[3/4] w-full max-w-[440px] border border-outline-variant md:sticky md:top-24">
              <Image
                src={talent.cover}
                alt={talent.coverAlt}
                fill
                priority
                sizes="(min-width: 768px) 40vw, 100vw"
                className="object-cover object-top"
              />
            </div>
          </div>

          {/* Profile (right) — nama, gender, MEASUREMENTS (dipindah dari kiri),
              SPECIALTIES, dan CTA. Di-center vertikal agar imbang dengan foto. */}
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
            <p className="text-label-uppercase text-secondary uppercase mt-4">
              {talent.gender}
            </p>

            <p className="text-body-lg text-secondary mt-6 max-w-prose">
              Represented exclusively by{" "}
              <span className="text-primary">Portal Management</span>.
            </p>

            {/* INSTAGRAM — direct ke profil IG talent agar client bisa langsung
                mengecek. Hanya tampil bila talent mengisi akunnya. */}
            {talent.instagram && (
              <a
                href={`https://instagram.com/${talent.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 self-start text-label-uppercase text-primary uppercase border-b border-primary pb-1 hover:text-accent hover:border-accent transition-colors"
              >
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
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
                @{talent.instagram}
              </a>
            )}

            {/* MEASUREMENTS — dipindah dari kartu kiri ke sini. */}
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-y-6 gap-x-6 border-t border-outline-variant mt-10 pt-8">
              {measurementOrder.map(({ key, label, suffix }) => (
                <div key={key}>
                  <dt className="text-label-uppercase text-secondary uppercase mb-1.5">
                    {label}
                  </dt>
                  <dd className="text-body-md text-primary">
                    {talent.measurements[key]}
                    {suffix ?? ""}
                  </dd>
                </div>
              ))}
            </dl>

            {/* SPECIALTIES — keahlian/jenis pekerjaan yang dikuasai talent. */}
            <div className="border-t border-outline-variant mt-8 pt-8">
              <p className="text-label-uppercase text-secondary uppercase mb-4">
                SPECIALTIES
              </p>
              {talent.categories.length === 0 ? (
                <p className="text-body-md text-on-surface-variant">
                  No specialties listed.
                </p>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {talent.categories.map((c) => (
                    <span
                      key={c}
                      className="text-label-uppercase text-primary uppercase border border-outline-variant px-4 py-2"
                    >
                      {categoryLabel[c]}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/collaboration"
              onClick={() => dispatch(setInquiryTalent(talent.name))}
              className="mt-10 inline-block self-start text-label-uppercase bg-primary text-on-primary px-10 py-4 hover:bg-accent transition-colors uppercase"
            >
              INQUIRE ABOUT THIS TALENT
            </Link>
          </div>
        </section>

        {/* Petunjuk scroll — biar pengunjung tahu masih ada portfolio di bawah. */}
        {talent.portfolio.length > 0 && (
          <div className="flex justify-center pb-10">
            <a
              href="#portfolio"
              className="group inline-flex flex-col items-center gap-1.5 text-secondary hover:text-primary transition-colors"
            >
              <span className="text-label-uppercase uppercase">
                View Portfolio
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
                className="animate-bounce"
              >
                <path strokeLinecap="square" d="M6 9l6 6 6-6" />
              </svg>
            </a>
          </div>
        )}

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
