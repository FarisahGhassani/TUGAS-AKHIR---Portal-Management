"use client";

import { useMemo, useState } from "react";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { TalentCard } from "@/components/talent/TalentCard";
import { TalentFilters } from "@/components/talent/TalentFilters";
import {
  useGetTalentsQuery,
  type TalentGender,
  type TalentWorkCategory,
  type TalentSummary,
} from "@/store/api/talentApi";

export default function TalentCatalogPage() {
  const [search, setSearch] = useState("");
  const [gender, setGender] = useState<TalentGender | "all">("all");
  const [category, setCategory] = useState<TalentWorkCategory | "all">("all");
  const [visibleCount, setVisibleCount] = useState(8);

  const { data, isFetching, isError } = useGetTalentsQuery({
    search: search || undefined,
    gender,
    category,
  });

  const columns = useMemo(() => {
    const items = (data ?? []).slice(0, visibleCount);
    const buckets: TalentSummary[][] = [[], [], []];
    items.forEach((talent, i) => {
      buckets[i % 3].push(talent);
    });
    return buckets;
  }, [data, visibleCount]);

  const total = data?.length ?? 0;
  const showLoadMore = total > visibleCount;

  return (
    <>
      <NavBar />
      <main className="flex-grow px-margin-mobile md:px-margin-desktop py-section max-w-editorial mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-gutter lg:gap-12">
          {/* Sidebar: title + filters (≈1/4, sticky) */}
          <aside className="lg:col-span-1 lg:sticky lg:top-24 lg:self-start flex flex-col gap-10">
            <div>
              <h1 className="font-display text-headline-lg-mobile md:text-headline-lg text-primary uppercase leading-[0.95]">
                <span className="block">OUR</span>
                <span className="block">TALENTS</span>
              </h1>
              <p className="text-body-md text-secondary mt-6">
                Discover the faces of Portal Management.
              </p>
            </div>
            <TalentFilters
              search={search}
              onSearchChange={(v) => {
                setSearch(v);
                setVisibleCount(8);
              }}
              gender={gender}
              onGenderChange={(v) => {
                setGender(v);
                setVisibleCount(8);
              }}
              category={category}
              onCategoryChange={(v) => {
                setCategory(v);
                setVisibleCount(8);
              }}
            />
          </aside>

          {/* Gallery (≈3/4) */}
          <div className="lg:col-span-3">
            {isError ? (
              <p className="text-label-uppercase text-error uppercase">
                Failed to load roster.
              </p>
            ) : isFetching && !data ? (
              <p className="text-label-uppercase text-on-surface-variant uppercase">
                Loading roster…
              </p>
            ) : total === 0 ? (
              <p className="text-label-uppercase text-on-surface-variant uppercase">
                No talent matches the current filters.
              </p>
            ) : (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-gutter">
                  {columns.map((col, i) => (
                    <div
                      key={i}
                      className={`flex flex-col gap-gutter ${i === 1 ? "lg:pt-16" : i === 2 ? "lg:pt-8" : ""
                        }`}
                    >
                      {col.map((talent) => (
                        <TalentCard key={talent.id} talent={talent} />
                      ))}
                    </div>
                  ))}
                </div>
                {showLoadMore && (
                  <div className="mt-16 flex justify-center">
                    <button
                      type="button"
                      onClick={() => setVisibleCount((v) => v + 8)}
                      className="text-label-uppercase text-primary border border-primary px-8 py-4 hover:bg-primary hover:text-on-primary transition-colors uppercase"
                    >
                      LOAD MORE TALENT
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
