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
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16 border-b border-outline-variant pb-6">
          <div>
            <p className="text-label-uppercase text-secondary mb-3 uppercase flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping bg-error opacity-75" />
                <span className="relative inline-flex h-2 w-2 bg-error" />
              </span>
              LIVE PROGRAMS &amp; EVENTS
            </p>
            <h2 className="font-display text-headline-lg-mobile md:text-headline-md text-primary uppercase">
              ANNOUNCEMENTS
            </h2>
          </div>
          {!isLoading && !isError && active.length > 0 && (
            <p className="text-label-uppercase text-secondary uppercase">
              {active.length} OPEN {active.length === 1 ? "PROGRAM" : "PROGRAMS"}
            </p>
          )}
        </div>

        {isLoading ? (
          <p className="text-label-uppercase text-on-surface-variant uppercase">
            Memuat pengumuman…
          </p>
        ) : isError ? (
          <p className="text-label-uppercase text-error uppercase">
            Gagal memuat pengumuman.
          </p>
        ) : active.length === 0 ? (
          <p className="text-label-uppercase text-on-surface-variant uppercase">
            Belum ada pengumuman aktif.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            {active.map((announcement) => (
              <AnnouncementCard
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

function AnnouncementCard({
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
      className="group relative flex flex-col bg-primary text-on-primary overflow-hidden border border-primary hover:-translate-y-1 transition-transform duration-300"
    >
      {/* === Poster event === */}
      <div className="relative aspect-[4/5] w-full overflow-hidden">
        <Image
          src={announcement.fotoPoster}
          alt={announcement.fotoPosterAlt}
          fill
          sizes="(min-width: 768px) 33vw, 100vw"
          className="object-cover grayscale group-hover:grayscale-0 scale-105 group-hover:scale-110 transition-all duration-700"
        />
        {/* Gradient supaya badge & teks tetap terbaca */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/30 to-transparent" />

        {/* Kategori program */}
        <span className="absolute top-4 left-4 bg-on-primary text-primary px-3 py-1 text-label-uppercase uppercase">
          {kategoriLabel[announcement.kategori]}
        </span>

        {/* Indikator pendaftaran dibuka */}
        <span className="absolute top-4 right-4 flex items-center gap-2 bg-primary/70 backdrop-blur-sm px-3 py-1 text-label-uppercase uppercase">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping bg-on-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 bg-on-primary" />
          </span>
          NOW OPEN
        </span>

        {/* Hitung mundur deadline */}
        <span
          className={`absolute bottom-4 left-4 px-3 py-1 text-label-uppercase uppercase ${
            isUrgent ? "bg-error text-on-error" : "bg-on-primary text-primary"
          }`}
        >
          {countdownLabel(daysLeft)}
        </span>
      </div>

      {/* === Detail program === */}
      <div className="relative z-10 flex flex-1 flex-col p-6">
        <h3 className="font-display text-headline-md mb-3 uppercase">
          {announcement.judul}
        </h3>
        <p className="text-body-md text-on-primary/70 mb-6 line-clamp-3">
          {announcement.ringkasan}
        </p>
        <div className="mt-auto flex items-center justify-between border-t border-on-primary/20 pt-4">
          <span
            className={`text-label-uppercase uppercase ${
              isUrgent ? "text-error" : "text-on-primary/70"
            }`}
          >
            {isUrgent ? "CLOSING SOON — " : "DEADLINE — "}
            {formatDeadline(announcement.tanggalBerakhir)}
          </span>
          <span
            aria-hidden="true"
            className="text-on-primary group-hover:translate-x-1 transition-transform"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path strokeLinecap="square" d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
