import { SmartImage as Image } from "@/components/ui/SmartImage";
import type { TalentPortfolioItem } from "@/store/api/talentApi";

export function PortfolioGallery({
  items,
}: {
  items: TalentPortfolioItem[];
}) {
  return (
    <section
      id="portfolio"
      className="px-margin-mobile md:px-margin-desktop pb-section scroll-mt-24"
    >
      <div className="mb-12 border-b border-outline-variant pb-4 flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="font-display text-headline-lg-mobile md:text-headline-lg text-primary uppercase leading-[0.95]">
          PORTFOLIO
        </h2>
        {items.length > 0 && (
          <p className="text-label-uppercase text-secondary uppercase">
            Selected work · {items.length} {items.length === 1 ? "piece" : "pieces"}
          </p>
        )}
      </div>
      {items.length === 0 ? (
        <p className="text-label-uppercase text-on-surface-variant uppercase">
          No portfolio work yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
          {items.map((item, idx) => {
            // Tata letak berirama: tiap kelipatan 3 melebar, sisanya menyempit.
            const span = idx % 3 === 0 ? "md:col-span-8" : "md:col-span-4";
            return (
              <figure key={item.id} className={span}>
                <div className="relative h-[420px] md:h-[560px] w-full overflow-hidden bg-surface-container">
                  <Image
                    src={item.image}
                    alt={item.alt}
                    fill
                    sizes="(min-width: 768px) 66vw, 100vw"
                    className="object-cover"
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
