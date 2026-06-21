"use client";

import Link from "next/link";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { RoleGate } from "@/components/auth/RoleGate";
import { Modal } from "@/components/Modal";
import { RegistrationCard } from "@/components/dashboard/RegistrationCard";
import { TalentRegistrationForm } from "@/components/dashboard/TalentRegistrationForm";
import { ClassRegistrationForm } from "@/components/dashboard/ClassRegistrationForm";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { closeRegModal } from "@/store/slices/uiSlice";
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
  // Sumber kebenaran role = auth state di Redux (RTK). Data dashboard hanya
  // diambil untuk talent; akun lain ditahan RoleGate sebelum query berjalan.
  const isTalent = useAppSelector((s) => s.auth.user?.role === "talent");
  // Nama hero diambil dari akun yang SEDANG login (auth/RTK), bukan dari data
  // mock dashboard — dulu selalu "ELARA" walau ganti akun. Ini sumber bug itu.
  const userName = useAppSelector((s) => s.auth.user?.name);
  // Modal pendaftaran yang sedang terbuka (talent | kelas | null) dari ui slice.
  const regModal = useAppSelector((s) => s.ui.regModal);
  const dispatch = useAppDispatch();
  const { data, isLoading, isError } = useGetDashboardSummaryQuery(undefined, {
    skip: !isTalent,
  });

  const close = () => dispatch(closeRegModal());

  // Riwayat digabung lalu diurut terbaru dulu — kartu pendaftaran sudah
  // memisahkan jenisnya, jadi histori cukup satu aliran kronologis.
  const history = data
    ? [...data.applications].sort(
        (a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime(),
      )
    : [];

  return (
    <>
      <NavBar />
      <main className="flex-grow">
        <RoleGate allow="talent">
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
            {/* Personalized hero — wordmark dikecilkan supaya dua kartu
                pendaftaran di bawahnya ikut terlihat tanpa banyak scroll. */}
            <section className="w-full pt-6 md:pt-10 px-margin-mobile md:px-margin-desktop max-w-editorial mx-auto">
              <p className="text-label-uppercase text-secondary uppercase mb-3">
                WELCOME BACK
              </p>
              <h1
                className="font-display text-primary uppercase leading-[0.85] tracking-[-0.04em] font-bold"
                style={{ fontSize: "clamp(48px, 11vw, 132px)" }}
              >
                {userName ?? data.greeting.name}
              </h1>
              <p className="text-body-lg text-secondary max-w-prose mt-5">
                {data.greeting.subtitle}
              </p>
            </section>

            {/* Dua kartu pendaftaran sejajar kiri–kanan — klik untuk membuka
                modal form-nya. Tanpa penomoran 01/02; keduanya setara. */}
            <section className="px-margin-mobile md:px-margin-desktop pt-8 md:pt-10 pb-12 max-w-editorial mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                <RegistrationCard
                  panelKey="talent"
                  heading="Ready to Unlock Your Potential?"
                  body="At Portal Management, we're always looking for fresh faces with confidence, personality, and potential. Whether you're experienced or just starting out, this could be the first step in your modelling journey."
                />
                <RegistrationCard
                  panelKey="kelas"
                  heading="Build Confidence. Learn from the Experts."
                  body="Learn catwalk, posing, personal branding, and photoshoot techniques directly from experienced mentors in a supportive and professional environment. Receive a certificate upon completion."
                />
              </div>
            </section>

            {/* Riwayat pendaftaran — gabungan talent & kelas, terbaru di atas. */}
            <section className="px-margin-mobile md:px-margin-desktop pb-12 max-w-editorial mx-auto">
              <div className="flex justify-between items-end mb-6 border-b border-outline-variant pb-4">
                <h2 className="font-display text-headline-md text-primary uppercase">
                  APPLICATION HISTORY
                </h2>
              </div>
              {history.length === 0 ? (
                <p className="text-label-uppercase text-on-surface-variant uppercase">
                  No applications yet. Pick a card above to get started.
                </p>
              ) : (
                <div className="flex flex-col gap-gutter">
                  {history.map((app) => (
                    <ApplicationStatusCard key={app.id} app={app} />
                  ))}
                </div>
              )}
            </section>

            {/* Kelas modelling yang sudah diikuti — sertifikat bisa diunduh
                untuk batch yang sudah lulus. */}
            <section className="px-margin-mobile md:px-margin-desktop pb-12 max-w-editorial mx-auto">
              <div className="flex justify-between items-end mb-6 border-b border-outline-variant pb-4">
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
            </section>

            {/* Modal form — disetir penuh oleh ui slice (RTK). */}
            <Modal
              open={regModal === "talent"}
              onClose={close}
              title="APPLY AS TALENT"
            >
              <TalentRegistrationForm />
            </Modal>
            <Modal
              open={regModal === "kelas"}
              onClose={close}
              title="JOIN MODELLING CLASS"
            >
              <ClassRegistrationForm />
            </Modal>
          </>
        )}
        </RoleGate>
      </main>
      <Footer />
    </>
  );
}

function ApplicationStatusCard({ app }: { app: TalentApplication }) {
  return (
    <article className="border border-outline-variant p-6 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-label-uppercase text-secondary uppercase mb-2">
            {typeLabel[app.jenis]}
          </p>
          <h3 className="font-display text-headline-md text-primary uppercase">
            {app.judul}
          </h3>
        </div>
        <StatusBadge {...applicationStatus[app.status]} />
      </div>
      <p className="text-caption text-secondary uppercase tracking-[0.1em]">
        Submitted {formatDate(app.tanggal)}
      </p>
    </article>
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
          {formatDate(cls.tglMulai)} – {formatDate(cls.tglBerakhir)}
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <StatusBadge {...paymentStatus[cls.statusPembayaran]} />
        <StatusBadge {...graduationStatus[cls.statusKelulusan]} />
      </div>
      {cls.statusKelulusan === "lulus" && cls.sertifikatUrl && (
        <Link
          href={cls.sertifikatUrl}
          className="self-start text-label-uppercase text-primary border border-primary px-6 py-3 hover:bg-accent hover:text-on-accent hover:border-accent transition-colors uppercase"
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
