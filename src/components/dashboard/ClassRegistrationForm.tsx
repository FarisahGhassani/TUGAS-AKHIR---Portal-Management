"use client";

import { useState } from "react";
import {
  useCreateApplicationMutation,
  useGetBatchesQuery,
  type ModellingBatch,
} from "@/store/api/dashboardApi";
import type { TalentGender } from "@/store/api/talentApi";
import { useAppSelector } from "@/store/hooks";
import { FileField, type PickedFile } from "./FileField";
import { UnitInput, CLOTHING_SIZES } from "./UnitInput";
import { SubmissionThankYou } from "./SubmissionThankYou";

const inputClass =
  "w-full border-0 border-b border-outline bg-transparent px-0 py-2 focus:outline-none focus:border-primary text-body-md text-primary placeholder:text-outline-variant transition-colors";
const labelClass = "text-label-uppercase text-primary block uppercase";
const selectClass = `${inputClass} appearance-none rounded-none cursor-pointer pr-8`;

const genderOptions: { value: TalentGender; label: string }[] = [
  { value: "female", label: "FEMALE" },
  { value: "male", label: "MALE" },
];

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
 * Form pendaftaran KELAS MODELLING — pilih batch + biodata dengan TEMPLATE YANG
 * SAMA dengan form talent (tanpa link portofolio): keduanya menulis ke tabel
 * `pendaftaran` yang sama (jenis = "kelas"), hanya aliran datanya yang berbeda
 * (kelas diterima → enrollment talent_batch). Submit lewat RTK mutation;
 * pembayaran diurus offline di luar aplikasi.
 */
export function ClassRegistrationForm({ onClose }: { onClose: () => void }) {
  const [createApplication, { isLoading }] = useCreateApplicationMutation();
  const { data: batches, isLoading: batchesLoading } = useGetBatchesQuery();
  const userId = useAppSelector((s) => s.auth.user?.id);

  const [batchId, setBatchId] = useState("");
  const [namaTalent, setNamaTalent] = useState("");
  const [gender, setGender] = useState<TalentGender>("female");
  const [tanggalLahir, setTanggalLahir] = useState("");
  const [tinggiBadan, setTinggiBadan] = useState("");
  const [beratBadan, setBeratBadan] = useState("");
  const [sizeBaju, setSizeBaju] = useState("");
  const [sizeSepatu, setSizeSepatu] = useState("");
  const [kartuIdentitas, setKartuIdentitas] = useState("");
  const [noTelepon, setNoTelepon] = useState("");
  const [instagram, setInstagram] = useState("");
  const [fotoProfil, setFotoProfil] = useState<PickedFile | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function validate(): string | null {
    if (!batchId) return "Please select a batch first.";
    if (!namaTalent.trim()) return "Full name is required.";
    if (!tanggalLahir) return "Date of birth is required.";
    if (!tinggiBadan || Number(tinggiBadan) <= 0)
      return "Enter a valid height.";
    if (!beratBadan || Number(beratBadan) <= 0) return "Enter a valid weight.";
    if (!sizeBaju.trim()) return "Clothing size is required.";
    if (!sizeSepatu.trim()) return "Shoe size is required.";
    if (!kartuIdentitas.trim()) return "ID card number is required.";
    if (!noTelepon.trim()) return "Phone number is required.";
    if (!instagram.trim()) return "Instagram account is required.";
    if (!fotoProfil?.dataUrl) return "Profile photo is required.";
    return null;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    if (!userId) {
      setError("Your session expired. Please log in again.");
      return;
    }
    setError(null);

    try {
      await createApplication({
        userId,
        jenis: "kelas",
        batchId,
        namaTalent: namaTalent.trim(),
        gender,
        tanggalLahir,
        tinggiBadan: Number(tinggiBadan),
        beratBadan: Number(beratBadan),
        sizeBaju: sizeBaju.trim(),
        sizeSepatu: sizeSepatu.trim(),
        kartuIdentitas: kartuIdentitas.trim(),
        noTelepon: noTelepon.trim(),
        instagram: instagram.trim().replace(/^@+/, ""),
        fotoProfil: fotoProfil!.dataUrl,
      }).unwrap();
      setSubmitted(true);
    } catch (err) {
      setError(
        err && typeof err === "object" && "data" in err
          ? ((err as { data?: { message?: string } }).data?.message ??
              "Failed to register. Please try again.")
          : "Failed to register. Please try again.",
      );
    }
  }

  if (submitted) {
    return <SubmissionThankYou onAction={onClose} />;
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
          className={selectClass}
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-1 md:col-span-2">
          <label htmlFor="c-nama" className={labelClass}>
            FULL NAME
          </label>
          <input
            id="c-nama"
            type="text"
            value={namaTalent}
            onChange={(e) => setNamaTalent(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="space-y-1 relative">
          <label htmlFor="c-gender" className={labelClass}>
            GENDER
          </label>
          <select
            id="c-gender"
            value={gender}
            onChange={(e) => setGender(e.target.value as TalentGender)}
            className={selectClass}
          >
            {genderOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label htmlFor="c-dob" className={labelClass}>
            DATE OF BIRTH
          </label>
          <input
            id="c-dob"
            type="date"
            value={tanggalLahir}
            onChange={(e) => setTanggalLahir(e.target.value)}
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
            value={noTelepon}
            onChange={(e) => setNoTelepon(e.target.value)}
            placeholder="0812-xxxx-xxxx"
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="space-y-1">
          <label htmlFor="c-height" className={labelClass}>
            HEIGHT
          </label>
          <UnitInput
            id="c-height"
            value={tinggiBadan}
            onChange={setTinggiBadan}
            unit="Cm"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="c-weight" className={labelClass}>
            WEIGHT
          </label>
          <UnitInput
            id="c-weight"
            value={beratBadan}
            onChange={setBeratBadan}
            unit="Kg"
          />
        </div>
        <div className="space-y-1 relative">
          <label htmlFor="c-baju" className={labelClass}>
            CLOTHING
          </label>
          <select
            id="c-baju"
            value={sizeBaju}
            onChange={(e) => setSizeBaju(e.target.value)}
            className={selectClass}
          >
            <option value="">SELECT</option>
            {CLOTHING_SIZES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="c-sepatu" className={labelClass}>
            SHOE
          </label>
          {/* Cukup ukuran EU; UK dihitung otomatis di API saat ditampilkan. */}
          <UnitInput
            id="c-sepatu"
            value={sizeSepatu}
            onChange={setSizeSepatu}
            unit="EU"
            placeholder="e.g. 40"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label htmlFor="c-ktp" className={labelClass}>
            ID CARD (KTP) NUMBER
          </label>
          <input
            id="c-ktp"
            type="text"
            value={kartuIdentitas}
            onChange={(e) => setKartuIdentitas(e.target.value)}
            placeholder="National ID number"
            className={inputClass}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="c-ig" className={labelClass}>
            INSTAGRAM
          </label>
          <input
            id="c-ig"
            type="text"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="@portfolio or personal"
            className={inputClass}
          />
          <p className="text-caption text-outline">
            Portfolio or personal account — we use this to reach you.
          </p>
        </div>
      </div>

      <FileField
        label="PROFILE PHOTO"
        accept="image/*"
        hint="Full body / composite card if available"
        value={fotoProfil}
        onChange={setFotoProfil}
      />

      <p className="text-caption text-secondary">
        Payment is arranged offline with the agency after you register.
      </p>

      {error && (
        <p className="text-caption text-error uppercase tracking-[0.1em]">
          {error}
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
