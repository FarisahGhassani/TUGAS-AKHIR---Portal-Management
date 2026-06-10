import Image from "next/image";
import Link from "next/link";
import type { TalentSummary } from "@/store/api/talentApi";

const aspectClass: Record<TalentSummary["thumbAspect"], string> = {
  "3/4": "aspect-[3/4]",
  "4/5": "aspect-[4/5]",
  "1/1": "aspect-square",
};

export function TalentCard({ talent }: { talent: TalentSummary }) {
  return (
    <Link
      href={`/talent/${talent.slug}`}
      className={`group relative block w-full bg-surface-container overflow-hidden ${aspectClass[talent.thumbAspect]}`}
    >
      <Image
        src={talent.cover}
        alt={talent.coverAlt}
        fill
        sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
        className="object-cover grayscale transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
        <h3 className="font-display text-headline-md text-on-primary mb-2 uppercase">
          {talent.name}
        </h3>
        <div className="flex items-center gap-3 text-label-uppercase text-on-primary/90 uppercase">
          <span>{talent.division}</span>
          <span aria-hidden="true">|</span>
          <span>{talent.heightLabel}</span>
        </div>
      </div>
    </Link>
  );
}
