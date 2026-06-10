"use client";

import Link from "next/link";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { Announcements } from "@/components/landing/Announcements";
import {
  useGetDashboardSummaryQuery,
  type ApplicationStatus,
  type ApplicationType,
  type PaymentStatus,
  type GraduationStatus,
  type TalentApplication,
  type TalentClass,
} from "@/store/api/dashboardApi";

type Tone = "positive" | "neutral" | "negative";

const applicationStatus: Record<
  ApplicationStatus,
  { label: string; tone: Tone }
> = {
  pending: { label: "PENDING", tone: "neutral" },
  diterima: { label: "ACCEPTED", tone: "positive" },
  ditolak: { label: "REJECTED", tone: "negative" },
};

const paymentStatus: Record<PaymentStatus, { label: string; tone: Tone }> = {
  pending: { label: "PAYMENT PENDING", tone: "neutral" },
  valid: { label: "PAID", tone: "positive" },
  tidak_valid: { label: "PAYMENT INVALID", tone: "negative" },
};

const graduationStatus: Record<
  GraduationStatus,
  { label: string; tone: Tone }
> = {
  belum: { label: "IN PROGRESS", tone: "neutral" },
  lulus: { label: "GRADUATED", tone: "positive" },
  tidak_lulus: { label: "NOT PASSED", tone: "negative" },
};

const typeLabel: Record<ApplicationType, string> = {
  talent: "TALENT",
  kelas: "CLASS",
};

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function formatDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return dateFormatter.format(date).toUpperCase();
}

export default function DashboardPage() {
  const { data, isLoading, isError } = useGetDashboardSummaryQuery();

  return (
    <>
      <NavBar />
      <main className="flex-grow">
        {isLoading || !data ? (
          <p className="px-margin-mobile md:px-margin-desktop py-section text-label-uppercase text-on-surface-variant uppercase">
            Loading your space…
          </p>
        ) : isError ? (
          <p className="px-margin-mobile md:px-margin-desktop py-section text-label-uppercase text-error uppercase">
            Failed to load dashboard.
          </p>
        ) : (
          <>
            {/* Personalized hero — landing-style wordmark */}
            <section className="w-full pt-6 md:pt-10 px-margin-mobile md:px-margin-desktop max-w-editorial mx-auto">
              <p className="text-label-uppercase text-secondary uppercase mb-4">
                WELCOME BACK
              </p>
              <h1
                className="font-display text-primary uppercase leading-[0.85] tracking-[-0.04em] font-bold"
                style={{ fontSize: "clamp(64px, 18vw, 240px)" }}
              >
                {data.greeting.name}
              </h1>
              <p className="text-body-lg text-secondary max-w-prose mt-6">
                {data.greeting.subtitle}
              </p>
            </section>

            {/* MY ACTIVITY — the talent-specific dashboard */}
            <section className="px-margin-mobile md:px-margin-desktop pt-section pb-section max-w-editorial mx-auto">
              <p className="text-label-uppercase text-secondary uppercase mb-3">
                MY ACTIVITY
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-section">
                <SummaryCard
                  label="TALENT APPLICATION"
                  value={
                    applicationStatus[
                      data.applications.find((a) => a.jenis === "talent")
                        ?.status ?? "pending"
                    ].label
                  }
                  valueAsHeadline
                />
                <SummaryCard
                  label="CLASSES JOINED"
                  value={data.classes.length.toString().padStart(2, "0")}
                />
                <SummaryCard
                  label="CERTIFICATES"
                  value={data.classes
                    .filter((c) => c.sertifikatUrl)
                    .length.toString()
                    .padStart(2, "0")}
                />
              </div>

              {/* Riwayat apply + status */}
              <div className="mb-section">
                <div className="flex justify-between items-end mb-8 border-b border-outline-variant pb-4">
                  <h2 className="font-display text-headline-md text-primary uppercase">
                    APPLICATION HISTORY
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="border-b border-outline-variant">
                        <th className="py-4 text-label-uppercase text-secondary font-normal w-1/5 uppercase">
                          DATE
                        </th>
                        <th className="py-4 text-label-uppercase text-secondary font-normal uppercase">
                          APPLICATION
                        </th>
                        <th className="py-4 text-label-uppercase text-secondary font-normal w-1/5 text-right uppercase">
                          STATUS
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.applications.map((app) => (
                        <ApplicationRow key={app.id} app={app} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Kelas modelling yang diikuti */}
              <div>
                <div className="flex justify-between items-end mb-8 border-b border-outline-variant pb-4">
                  <h2 className="font-display text-headline-md text-primary uppercase">
                    MODELLING CLASSES
                  </h2>
                </div>
                {data.classes.length === 0 ? (
                  <p className="text-label-uppercase text-on-surface-variant uppercase">
                    You haven’t joined any class yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                    {data.classes.map((cls) => (
                      <ClassCard key={cls.id} cls={cls} />
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Pengumuman publik tetap tampil, seperti landing page */}
            <Announcements />
          </>
        )}
      </main>
      <Footer />
    </>
  );
}

function SummaryCard({
  label,
  value,
  valueAsHeadline,
}: {
  label: string;
  value: string;
  valueAsHeadline?: boolean;
}) {
  return (
    <div className="border border-outline-variant p-8 bg-surface-container-lowest flex flex-col justify-between aspect-[4/3]">
      <h3 className="text-label-uppercase text-secondary uppercase">{label}</h3>
      <p
        className={`font-display ${
          valueAsHeadline ? "text-headline-md" : "text-headline-lg-mobile"
        } text-primary uppercase leading-none`}
      >
        {value}
      </p>
    </div>
  );
}

function ApplicationRow({ app }: { app: TalentApplication }) {
  return (
    <tr className="border-b border-surface-container">
      <td className="py-6 text-body-md text-primary whitespace-nowrap">
        {formatDate(app.tanggal)}
      </td>
      <td className="py-6">
        <span className="text-label-uppercase text-secondary uppercase mr-3 border border-outline-variant px-2 py-0.5">
          {typeLabel[app.jenis]}
        </span>
        <span className="font-display text-headline-md text-primary uppercase">
          {app.judul}
        </span>
      </td>
      <td className="py-6 text-right">
        <StatusBadge {...applicationStatus[app.status]} />
      </td>
    </tr>
  );
}

function ClassCard({ cls }: { cls: TalentClass }) {
  return (
    <div className="border border-outline-variant p-8 flex flex-col gap-6">
      <div>
        <p className="text-label-uppercase text-secondary uppercase mb-2">
          BATCH {cls.batchKe.toString().padStart(2, "0")}
        </p>
        <h3 className="font-display text-headline-md text-primary uppercase">
          {cls.namaBatch}
        </h3>
        <p className="text-body-md text-secondary mt-3">
          {formatDate(cls.tglMulai)} — {formatDate(cls.tglBerakhir)}
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <StatusBadge {...paymentStatus[cls.statusPembayaran]} />
        <StatusBadge {...graduationStatus[cls.statusKelulusan]} />
      </div>
      {cls.statusKelulusan === "lulus" && cls.sertifikatUrl && (
        <Link
          href={cls.sertifikatUrl}
          className="self-start text-label-uppercase text-primary border border-primary px-6 py-3 hover:bg-primary hover:text-on-primary transition-colors uppercase"
        >
          DOWNLOAD CERTIFICATE
        </Link>
      )}
    </div>
  );
}

function StatusBadge({ label, tone }: { label: string; tone: Tone }) {
  const styles: Record<Tone, { box: string; dot: string }> = {
    positive: { box: "border-primary text-primary", dot: "bg-primary" },
    neutral: {
      box: "border-outline-variant text-secondary",
      dot: "bg-secondary",
    },
    negative: { box: "border-error text-error", dot: "bg-error" },
  };
  const s = styles[tone];
  return (
    <span
      className={`inline-flex items-center gap-2 border px-3 py-1 text-label-uppercase uppercase ${s.box}`}
    >
      <span className={`w-1.5 h-1.5 ${s.dot}`} aria-hidden="true" />
      {label}
    </span>
  );
}
