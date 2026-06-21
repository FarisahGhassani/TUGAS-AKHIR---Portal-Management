"use client";

import { useState } from "react";
import {
  useCreateApplicationMutation,
  useGetBatchesQuery,
  type ModellingBatch,
} from "@/store/api/dashboardApi";
import { useAppSelector } from "@/store/hooks";
import { FileField, type PickedFile } from "./FileField";

const inputClass =
  "w-full border-0 border-b border-outline bg-transparent px-0 py-2 focus:outline-none focus:border-primary text-body-md text-primary placeholder:text-outline-variant transition-colors";
const labelClass = "text-label-uppercase text-primary block uppercase";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});
function formatDate(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : dateFormatter.format(d).toUpperCase();
}

/**
 * Form pendaftaran KELAS MODELLING — PRD: pilih batch yang tersedia + unggah
 * bukti pembayaran. Daftar batch diambil via RTK Query. Submit lewat RTK
 * mutation ke store pendaftaran yang sama (jenis = "kelas").
 */
export function ClassRegistrationForm() {
  const [createApplication, { isLoading }] = useCreateApplicationMutation();
  const { data: batches, isLoading: batchesLoading } = useGetBatchesQuery();
  const userName = useAppSelector((s) => s.auth.user?.name);

  const [batchId, setBatchId] = useState("");
  const [namaTalent, setNamaTalent] = useState(userName ?? "");
  const [noTelepon, setNoTelepon] = useState("");
  const [buktiPembayaran, setBuktiPembayaran] = useState<PickedFile | null>(
    null,
  );

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    if (!batchId) {
      setError("Please select a batch first.");
      return;
    }
    if (!namaTalent.trim()) {
      setError("Full name is required.");
      return;
    }
    if (!noTelepon.trim()) {
      setError("Phone number is required.");
      return;
    }
    if (!buktiPembayaran) {
      setError("Please upload your payment proof.");
      return;
    }

    try {
      await createApplication({
        jenis: "kelas",
        batchId,
        namaTalent: namaTalent.trim(),
        noTelepon: noTelepon.trim(),
        buktiPembayaran: buktiPembayaran.name,
      }).unwrap();
      setBatchId("");
      setBuktiPembayaran(null);
      setSuccess(true);
    } catch (err) {
      const message =
        err && typeof err === "object" && "data" in err
          ? ((err as { data?: { message?: string } }).data?.message ??
            "Failed to register. Please try again.")
          : "Failed to register. Please try again.";
      setError(message);
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
      <div className="space-y-1 relative">
        <label htmlFor="c-batch" className={labelClass}>
          SELECT BATCH
        </label>
        <select
          id="c-batch"
          required
          value={batchId}
          onChange={(e) => setBatchId(e.target.value)}
          disabled={batchesLoading}
          className={`${inputClass} appearance-none rounded-none cursor-pointer pr-8`}
        >
          <option value="" disabled>
            {batchesLoading ? "Loading batches…" : "Choose a class batch"}
          </option>
          {(batches ?? []).map((b) => (
            <option
              key={b.id}
              value={b.id}
              disabled={b.statusPendaftaran === "tutup"}
            >
              {`Batch ${String(b.batchKe).padStart(2, "0")} · ${b.namaBatch}`}
              {b.statusPendaftaran === "tutup" ? " (CLOSED)" : ""}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute right-0 bottom-2 text-primary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path strokeLinecap="square" d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </div>

      {/* Info batch terpilih — jadwal & kuota (PRD: lihat info batch). */}
      {batchId && batches && <BatchInfo batchId={batchId} batches={batches} />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label htmlFor="c-nama" className={labelClass}>
            FULL NAME
          </label>
          <input
            id="c-nama"
            type="text"
            required
            value={namaTalent}
            onChange={(e) => setNamaTalent(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="c-phone" className={labelClass}>
            PHONE NUMBER
          </label>
          <input
            id="c-phone"
            type="tel"
            required
            value={noTelepon}
            onChange={(e) => setNoTelepon(e.target.value)}
            placeholder="0812-xxxx-xxxx"
            className={inputClass}
          />
        </div>
      </div>

      <div className="space-y-1">
        <FileField
          label="PAYMENT PROOF"
          accept="image/*,application/pdf"
          value={buktiPembayaran}
          onChange={setBuktiPembayaran}
        />
        <p className="text-caption text-secondary mt-1">
          Payment is processed offline; the agency validates your proof manually.
        </p>
      </div>

      {error && (
        <p className="text-caption text-error uppercase tracking-[0.1em]">
          {error}
        </p>
      )}
      {success && (
        <p className="text-caption text-primary uppercase tracking-[0.1em]">
          Class registration submitted. Track its status in your history below.
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary text-on-primary text-label-uppercase py-4 px-8 hover:bg-accent transition-colors uppercase disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "SUBMITTING…" : "REGISTER FOR CLASS"}
      </button>
    </form>
  );
}

function BatchInfo({
  batchId,
  batches,
}: {
  batchId: string;
  batches: ModellingBatch[];
}) {
  const batch = batches.find((b) => b.id === batchId);
  if (!batch) return null;
  return (
    <dl className="grid grid-cols-2 gap-x-gutter gap-y-2 border border-outline-variant p-4">
      <div>
        <dt className="text-label-uppercase text-secondary uppercase mb-1">
          SCHEDULE
        </dt>
        <dd className="text-body-md text-primary">
          {formatDate(batch.tglMulai)} – {formatDate(batch.tglBerakhir)}
        </dd>
      </div>
      <div>
        <dt className="text-label-uppercase text-secondary uppercase mb-1">
          QUOTA
        </dt>
        <dd className="text-body-md text-primary">{batch.kuota} seats</dd>
      </div>
    </dl>
  );
}
