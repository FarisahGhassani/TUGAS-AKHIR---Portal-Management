import Link from "next/link";
import type { LandingContent } from "@/store/api/landingApi";

export function Capabilities({
  data,
}: {
  data: LandingContent["capabilities"];
}) {
  return (
    <section className="py-section px-margin-mobile md:px-margin-desktop bg-surface-container-low">
      <div className="max-w-editorial mx-auto">
        <div className="mb-16 text-center">
          <h2 className="text-headline-md text-primary uppercase">
            {data.eyebrow}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-gutter gap-y-12">
          {data.items.map((item) => (
            <div
              key={item.title}
              className="border-t border-outline-variant pt-6"
            >
              <h3 className="text-label-uppercase text-primary mb-4 uppercase">
                {item.title}
              </h3>
              <p className="text-body-md text-secondary mb-6">
                {item.description}
              </p>
              <Link
                href="/services"
                className="text-caption text-primary hover:opacity-70 transition-opacity uppercase"
              >
                LEARN MORE
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
