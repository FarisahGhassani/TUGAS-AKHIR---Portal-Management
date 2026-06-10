import Image from "next/image";
import type { TalentPortfolioItem } from "@/store/api/talentApi";

export function PortfolioGallery({
  items,
}: {
  items: TalentPortfolioItem[];
}) {
  return (
    <section className="px-margin-mobile md:px-margin-desktop pb-section">
      <div className="mb-12 border-b border-outline-variant pb-4">
        <h2 className="font-display text-headline-md text-primary uppercase">
          PORTFOLIO
        </h2>
      </div>
      {items.length === 0 ? (
        <p className="text-label-uppercase text-on-surface-variant uppercase">
          No portfolio work yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
          {items.map((item, idx) => {
            const span =
              item.span === "tall"
                ? "md:col-span-4"
                : item.span === "wide"
                  ? "md:col-span-8"
                  : idx % 3 === 0
                    ? "md:col-span-8"
                    : "md:col-span-4";
            return (
              <figure key={item.id} className={span}>
                <div className="relative h-[420px] md:h-[560px] w-full overflow-hidden bg-surface-container">
                  <Image
                    src={item.image}
                    alt={item.alt}
                    fill
                    sizes="(min-width: 768px) 66vw, 100vw"
                    className="object-cover grayscale"
                  />
                </div>
                <figcaption className="text-label-uppercase text-secondary uppercase mt-3">
                  {item.caption}
                </figcaption>
              </figure>
            );
          })}
        </div>
      )}
    </section>
  );
}
