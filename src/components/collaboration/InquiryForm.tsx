"use client";

import { useState } from "react";
import { useCreateInquiryMutation } from "@/store/api/inquiryApi";

const JOB_TYPES = [
  "Editorial",
  "Commercial",
  "Runway",
  "Campaign",
  "Lookbook",
  "Photoshoot",
  "Other",
] as const;

// Field bersama agar gaya input konsisten dengan form auth di project ini.
const inputClass =
  "w-full border-0 border-b border-outline bg-transparent px-0 py-2 focus:outline-none focus:border-primary text-body-md text-primary placeholder:text-outline-variant transition-colors";
const labelClass = "text-label-uppercase text-primary block uppercase";

export function InquiryForm({ defaultName }: { defaultName?: string }) {
  const [createInquiry, { isLoading }] = useCreateInquiryMutation();

  const [namaClient, setNamaClient] = useState(defaultName ?? "");
  const [noTelepon, setNoTelepon] = useState("");
  const [judulProject, setJudulProject] = useState("");
  const [brand, setBrand] = useState("");
  const [jenisJob, setJenisJob] = useState("");
  const [tanggalProject, setTanggalProject] = useState("");
  const [modelPilihan, setModelPilihan] = useState("");
  const [catatanClient, setCatatanClient] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    if (!jenisJob) {
      setError("Pilih jenis job terlebih dahulu.");
      return;
    }

    try {
      await createInquiry({
        namaClient,
        noTelepon,
        judulProject,
        brand: brand || undefined,
        jenisJob,
        tanggalProject: tanggalProject || undefined,
        modelPilihan: modelPilihan || undefined,
        catatanClient: catatanClient || undefined,
      }).unwrap();

      // Reset field project, biarkan kontak terisi untuk pengajuan berikutnya.
      setJudulProject("");
      setBrand("");
      setJenisJob("");
      setTanggalProject("");
      setModelPilihan("");
      setCatatanClient("");
      setSuccess(true);
    } catch (err) {
      const message =
        err && typeof err === "object" && "data" in err
          ? ((err as { data?: { message?: string } }).data?.message ??
            "Gagal mengirim inquiry. Coba lagi.")
          : "Gagal mengirim inquiry. Coba lagi.";
      setError(message);
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label htmlFor="inq-nama" className={labelClass}>
            NAMA / PIC
          </label>
          <input
            id="inq-nama"
            type="text"
            required
            value={namaClient}
            onChange={(e) => setNamaClient(e.target.value)}
            placeholder="Nama Anda atau PIC"
            className={inputClass}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="inq-telepon" className={labelClass}>
            NO. TELEPON
          </label>
          <input
            id="inq-telepon"
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
        <label htmlFor="inq-judul" className={labelClass}>
          JUDUL PROJECT
        </label>
        <input
          id="inq-judul"
          type="text"
          required
          value={judulProject}
          onChange={(e) => setJudulProject(e.target.value)}
          placeholder="mis. Spring Editorial Campaign"
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label htmlFor="inq-brand" className={labelClass}>
            BRAND / PERUSAHAAN
          </label>
          <input
            id="inq-brand"
            type="text"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="Opsional"
            className={inputClass}
          />
        </div>
        <div className="space-y-1 relative">
          <label htmlFor="inq-jenis" className={labelClass}>
            JENIS JOB
          </label>
          <select
            id="inq-jenis"
            required
            value={jenisJob}
            onChange={(e) => setJenisJob(e.target.value)}
            className={`${inputClass} appearance-none rounded-none cursor-pointer pr-8`}
          >
            <option value="" disabled>
              Pilih jenis job
            </option>
            {JOB_TYPES.map((job) => (
              <option key={job} value={job}>
                {job}
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
      </div>

      <div className="space-y-1">
        <label htmlFor="inq-tanggal" className={labelClass}>
          TANGGAL PROJECT
        </label>
        <input
          id="inq-tanggal"
          type="date"
          value={tanggalProject}
          onChange={(e) => setTanggalProject(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="inq-model" className={labelClass}>
          MODEL / TALENT PILIHAN
        </label>
        <textarea
          id="inq-model"
          rows={2}
          value={modelPilihan}
          onChange={(e) => setModelPilihan(e.target.value)}
          placeholder="mis. 2 talent runway wanita, tinggi 175cm+"
          className={`${inputClass} resize-none`}
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="inq-catatan" className={labelClass}>
          CATATAN TAMBAHAN
        </label>
        <textarea
          id="inq-catatan"
          rows={3}
          value={catatanClient}
          onChange={(e) => setCatatanClient(e.target.value)}
          placeholder="Konsep, lokasi, budget, atau detail lain"
          className={`${inputClass} resize-none`}
        />
      </div>

      {error && (
        <p className="text-caption text-error uppercase tracking-[0.1em]">
          {error}
        </p>
      )}
      {success && (
        <p className="text-caption text-primary uppercase tracking-[0.1em]">
          Inquiry terkirim — pantau statusnya di bawah.
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary text-on-primary text-label-uppercase py-4 px-8 hover:opacity-70 transition-opacity uppercase disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "MENGIRIM…" : "KIRIM PROJECT BRIEF"}
      </button>
    </form>
  );
}
