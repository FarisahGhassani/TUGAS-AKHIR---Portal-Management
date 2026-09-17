import { SmartImage as Image } from "@/components/ui/SmartImage";
import Link from "next/link";
import type { TalentSummary } from "@/store/api/talentApi";

const categoryLabel: Record<string, string> = {
  photoshoot: "PHOTOSHOOT",
  runway: "RUNWAY",
  tvc: "TVC",
  commercial: "COMMERCIAL",
  "muse-beauty": "MUSE / BEAUTY",
};

export function TalentCard({ talent }: { talent: TalentSummary }) {
  // Kategori utama (pertama) sebagai label kartu; fallback ke gender.
  const tag = talent.categories[0]
    ? categoryLabel[talent.categories[0]]
    : talent.gender.toUpperCase();
  return (
    <Link
      href={`/talent/${talent.slug}`}
      className="group relative block w-full bg-surface-container overflow-hidden aspect-[3/4]"
    >
      <Image
        src={talent.cover}
        alt={talent.coverAlt}
        fill
        sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
        className="object-cover transition-all duration-700 group-hover:scale-105 group-hover:grayscale"
      />
      <div className="absolute inset-0 bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
        <h3 className="font-display text-headline-md text-on-primary mb-2 uppercase">
          {talent.name}
        </h3>
        <div className="flex items-center gap-3 text-label-uppercase text-on-primary/90 uppercase">
          <span>{tag}</span>
          <span aria-hidden="true">|</span>
          <span>{talent.heightLabel}</span>
        </div>
      </div>
    </Link>
  );
}
