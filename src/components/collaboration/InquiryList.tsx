"use client";

import {
  useGetMyInquiriesQuery,
  type ClientInquiry,
  type InquiryStatus,
} from "@/store/api/inquiryApi";
import { useAppSelector } from "@/store/hooks";

// Urutan tahap (nilai data tetap Indonesia, label tampilan Inggris).
// "selesai" sengaja ditandai biar badge-nya bisa diwarnain hijau pas tercapai.
const STATUS_FLOW: { key: InquiryStatus; label: string }[] = [
  { key: "submitted", label: "SUBMITTED" },
  { key: "in_progress", label: "IN PROGRESS" },
  { key: "completed", label: "COMPLETED" },
];

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function formatDate(iso?: string) {
  if (!iso) return "-";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return dateFormatter.format(date).toUpperCase();
}

// Durasi proyek "27 JUN 2026 – 29 JUN 2026"; satu tanggal saja bila salah satu kosong.
function formatRange(start?: string, end?: string) {
  if (!start && !end) return "-";
  if (start && end) return `${formatDate(start)} – ${formatDate(end)}`;
  return formatDate(start || end);
}

export function InquiryList() {
  const userId = useAppSelector((s) => s.auth.user?.id);
  const { data, isLoading, isError } = useGetMyInquiriesQuery(userId ?? "", {
    skip: !userId,
  });

  if (isError) {
    return (
      <p className="text-label-uppercase text-error uppercase">
        Failed to load your inquiries.
      </p>
    );
  }

  if (isLoading || !data) {
    return (
      <p className="text-label-uppercase text-on-surface-variant uppercase">
        Loading inquiries…
      </p>
    );
  }

  if (data.length === 0) {
    return (
      <p className="text-label-uppercase text-on-surface-variant uppercase">
        No inquiries yet. Send your first project brief above.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-gutter">
      {data.map((inquiry) => (
        <InquiryCard key={inquiry.id} inquiry={inquiry} />
      ))}
    </div>
  );
}

function InquiryCard({ inquiry }: { inquiry: ClientInquiry }) {
  const activeIndex = STATUS_FLOW.findIndex((s) => s.key === inquiry.status);

  return (
    <article className="border border-outline-variant p-8 flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-label-uppercase text-secondary uppercase mb-2">
            {inquiry.jenisJob}
            {inquiry.brand ? ` · ${inquiry.brand}` : ""}
          </p>
          <h3 className="font-display text-headline-md text-primary uppercase">
            {inquiry.judulProject}
          </h3>
        </div>
        <p className="text-caption text-secondary uppercase tracking-[0.1em]">
          Submitted {formatDate(inquiry.createdAt)}
        </p>
      </div>

      {/* Pipeline status: Submitted → In Progress → Completed */}
      <StatusPipeline activeIndex={activeIndex} />

      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-gutter gap-y-3">
        <Field
          label="PROJECT TIMELINE"
          value={formatRange(
            inquiry.tanggalProject,
            inquiry.tanggalProjectSelesai,
          )}
        />
        <Field label="CONTACT" value={inquiry.noTelepon} />
        {inquiry.modelPilihan && (
          <Field label="PREFERRED TALENT" value={inquiry.modelPilihan} wide />
        )}
        {inquiry.catatanClient && (
          <Field label="YOUR NOTES" value={inquiry.catatanClient} wide />
        )}
      </dl>

      {/* Catatan dari agency yang ikut dipantau client */}
      {inquiry.catatanAdmin && (
        <div className="border-l-2 border-primary bg-surface-container-lowest px-5 py-4">
          <p className="text-label-uppercase text-secondary uppercase mb-2">
            NOTE FROM THE AGENCY
          </p>
          <p className="text-body-md text-primary">{inquiry.catatanAdmin}</p>
        </div>
      )}
    </article>
  );
}

function StatusPipeline({ activeIndex }: { activeIndex: number }) {
  return (
    <ol className="flex items-center gap-2" aria-label="Inquiry status">
      {STATUS_FLOW.map((step, i) => {
        const reached = i <= activeIndex;
        const isCurrent = i === activeIndex;
        // Tahap "Completed" pas udah tercapai diwarnain hijau (accent), bukan
        // hitam — biar keliatan jelas kalau project-nya udah kelar.
        const isDone = step.key === "completed" && reached;

        const chipClass = isDone
          ? "border-accent text-accent"
          : reached
            ? "border-primary text-primary"
            : "border-outline-variant text-on-surface-variant";
        const dotClass = isDone
          ? "bg-accent"
          : isCurrent
            ? "bg-primary"
            : reached
              ? "bg-primary/50"
              : "bg-outline-variant";

        return (
          <li key={step.key} className="flex items-center gap-2 flex-1">
            <span
              className={`flex items-center gap-2 border px-3 py-1 text-label-uppercase uppercase ${chipClass}`}
            >
              <span className={`w-1.5 h-1.5 ${dotClass}`} aria-hidden="true" />
              {step.label}
            </span>
            {i < STATUS_FLOW.length - 1 && (
              <span
                className={`h-px flex-1 ${
                  i < activeIndex ? "bg-primary" : "bg-outline-variant"
                }`}
                aria-hidden="true"
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function Field({
  label,
  value,
  wide,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <dt className="text-label-uppercase text-secondary uppercase mb-1">
        {label}
      </dt>
      <dd className="text-body-md text-primary">{value}</dd>
    </div>
  );
}
