import Link from "next/link";
import type { LandingContent } from "@/store/api/landingApi";

export function CTASection({ data }: { data: LandingContent["cta"] }) {
  return (
    <section className="py-section px-margin-mobile md:px-margin-desktop bg-primary text-on-primary text-center">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-headline-lg-mobile md:text-headline-lg mb-8 uppercase font-display">
          {data.title}
        </h2>
        <p className="text-body-lg text-primary-fixed-dim mb-12">{data.body}</p>
        <Link
          href="/auth"
          className="inline-block px-12 py-4 border border-on-primary text-on-primary text-label-uppercase uppercase hover:bg-on-primary hover:text-primary transition-colors duration-300"
        >
          {data.buttonLabel}
        </Link>
      </div>
    </section>
  );
}
