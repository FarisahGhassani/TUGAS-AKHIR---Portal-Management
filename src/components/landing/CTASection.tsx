import Link from "next/link";
import type { LandingContent } from "@/store/api/landingApi";

export function CTASection({ data }: { data: LandingContent["cta"] }) {
  return (
    <section className="py-section px-margin-mobile md:px-margin-desktop bg-primary text-on-primary text-center">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-headline-lg-mobile md:text-headline-lg mb-6 uppercase font-display">
          {data.title}
        </h2>
        <p className="text-body-lg text-primary-fixed-dim mb-8">{data.body}</p>

        {/* Dua ajakan buat (calon) talent. Dua-duanya butuh akun talent, jadi
            sama-sama nuju /auth — tapi pakai ?intent biar form daftar langsung
            kepilih role Talent + nampilin konteks yang sesuai. */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/dashboard"
            className="inline-block px-12 py-4 border border-on-primary text-on-primary text-label-uppercase uppercase hover:bg-accent hover:text-on-accent hover:border-accent transition-colors duration-300"
          >
            {data.buttonLabel}
          </Link>
          <Link
            href="/dashboard"
            className="inline-block px-12 py-4 border border-on-primary text-on-primary text-label-uppercase uppercase hover:bg-accent hover:text-on-accent hover:border-accent transition-colors duration-300"
          >
            JOIN THE MODELLING CLASS
          </Link>
        </div>

        {/* Ajakan terpisah buat brand/client — nuju alur collaboration. */}
        <div className="mt-10 pt-8 border-t border-on-primary/20">
          <p className="text-body-md text-primary-fixed-dim mb-6">
            Interested to collaborate with Portal Management?
          </p>
          <Link
            href="/collaboration"
            className="inline-block px-12 py-4 bg-on-primary text-primary text-label-uppercase uppercase hover:bg-accent hover:text-on-accent transition-colors duration-300"
          >
            LET&apos;S COLLABORATE
          </Link>
        </div>
      </div>
    </section>
  );
}
