"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useGetActiveAnnouncementsQuery,
  daysUntilDeadline,
  isAnnouncementExpired,
  type Announcement,
  type AnnouncementKategori,
} from "@/store/api/announcementsApi";

const kategoriLabel: Record<AnnouncementKategori, string> = {
  casting: "CASTING CALL",
  kelas: "MODELLING CLASS",
  umum: "BULLETIN",
};

const deadlineFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function formatDeadline(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return deadlineFormatter.format(date).toUpperCase();
}

function countdownLabel(daysLeft: number) {
  if (daysLeft <= 0) return "LAST DAY";
  if (daysLeft === 1) return "1 DAY LEFT";
  return `${daysLeft} DAYS LEFT`;
}

export function Announcements() {
  const { data, isLoading, isError } = useGetActiveAnnouncementsQuery();

  // Safety-net takedown di sisi klien: kalau deadline terlewat saat cache
  // RTK Query masih hidup, item kedaluwarsa tetap tidak ditampilkan.
  const now = new Date();
  const active = (data ?? []).filter(
    (a) => !isAnnouncementExpired(a.tanggalBerakhir, now),
  );

  return (
    <section className="py-section px-margin-mobile md:px-margin-desktop bg-surface-container-lowest">
      <div className="max-w-editorial mx-auto">
        {/* Header — softened from the old "live programs" siren to a calm,
            editorial news label marked only by a small brand-green dot. */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6 md:mb-8">
          <div>
            <p className="text-label-uppercase text-secondary mb-3 uppercase flex items-center gap-2">
              <span
                className="inline-block h-1.5 w-1.5 bg-accent"
                aria-hidden="true"
              />
              CURRENT NEWS / EVENTS
            </p>
            <h2 className="font-display text-headline-lg-mobile md:text-headline-md text-primary uppercase">
              ANNOUNCEMENTS
            </h2>
          </div>
          {!isLoading && !isError && active.length > 0 && (
            <span className="self-start md:self-auto border border-outline-variant px-4 py-2 text-label-uppercase text-secondary uppercase whitespace-nowrap">
              {active.length} OPEN{" "}
              {active.length === 1 ? "PROGRAM" : "PROGRAMS"}
            </span>
          )}
        </div>

        {/* Body — full-width stacked rows so every announcement reads across the
            whole board instead of being boxed into narrow columns. */}
        {isLoading ? (
          <p className="text-label-uppercase text-on-surface-variant uppercase py-12 text-center">
            Memuat pengumuman…
          </p>
        ) : isError ? (
          <p className="text-label-uppercase text-error uppercase py-12 text-center">
            Gagal memuat pengumuman.
          </p>
        ) : active.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="border-t border-outline-variant">
            {active.map((announcement) => (
              <AnnouncementRow
                key={announcement.id}
                announcement={announcement}
                now={now}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-4 border border-dashed border-outline-variant py-10 px-6">
      <span
        className="inline-flex h-10 w-10 items-center justify-center border border-outline-variant text-secondary"
        aria-hidden="true"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path strokeLinecap="square" d="M4 5h16v14H4zM4 9h16M8 3v4M16 3v4" />
        </svg>
      </span>
      <p className="text-label-uppercase text-primary uppercase">
        Belum ada program aktif
      </p>
      <p className="text-body-md text-secondary max-w-prose">
        Casting call dan kelas modelling berikutnya akan tampil di sini. Pantau
        terus halaman ini.
      </p>
    </div>
  );
}

function AnnouncementRow({
  announcement,
  now,
}: {
  announcement: Announcement;
  now: Date;
}) {
  const daysLeft = daysUntilDeadline(announcement.tanggalBerakhir, now);
  const isUrgent = daysLeft <= 3;

  return (
    <Link
      href={announcement.link}
      className="group grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-gutter items-center border-b border-outline-variant py-5 md:py-6 transition-colors hover:border-accent"
    >
      {/* === Poster event — full colour, eased to grayscale on hover === */}
      <div className="relative md:col-span-3 aspect-[4/3] md:aspect-[4/5] w-full overflow-hidden bg-surface-container">
        <Image
          src={announcement.fotoPoster}
          alt={announcement.fotoPosterAlt}
          fill
          sizes="(min-width: 768px) 25vw, 100vw"
          className="object-cover scale-105 group-hover:scale-100 group-hover:grayscale transition-all duration-700"
        />
        <span className="absolute top-3 left-3 bg-on-primary text-primary px-3 py-1 text-label-uppercase uppercase">
          {kategoriLabel[announcement.kategori]}
        </span>
      </div>

      {/* === Detail program === */}
      <div className="md:col-span-7 flex flex-col gap-3">
        <span className="flex items-center gap-2 text-label-uppercase text-secondary uppercase">
          <span className="inline-block h-1.5 w-1.5 bg-accent" aria-hidden="true" />
          NOW OPEN
        </span>
        <h3 className="font-display text-headline-lg-mobile md:text-headline-md text-primary uppercase">
          {announcement.judul}
        </h3>
        <p className="text-body-md text-secondary max-w-prose line-clamp-2">
          {announcement.ringkasan}
        </p>
      </div>

      {/* === Deadline + arrow === */}
      <div className="md:col-span-2 flex items-center justify-between md:flex-col md:items-end gap-3 md:text-right">
        <span
          className={`text-label-uppercase uppercase ${
            isUrgent ? "text-error" : "text-secondary"
          }`}
        >
          {countdownLabel(daysLeft)}
          <span className="block text-on-surface-variant mt-1">
            {formatDeadline(announcement.tanggalBerakhir)}
          </span>
        </span>
        <span
          aria-hidden="true"
          className="text-primary group-hover:text-accent group-hover:translate-x-1 transition-all"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path strokeLinecap="square" d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </span>
      </div>
    </Link>
  );
}
