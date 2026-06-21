"use client";

import { useEffect, useState } from "react";
import { useCreateInquiryMutation } from "@/store/api/inquiryApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setInquiryTalent } from "@/store/slices/uiSlice";

const JOB_TYPES = [
  "Editorial",
  "Commercial",
  "Runway",
  "Campaign",
  "Lookbook",
  "Photoshoot",
  "Other",
] as const;

// Field bersama biar gaya input konsisten sama form auth di project ini.
const inputClass =
  "w-full border-0 border-b border-outline bg-transparent px-0 py-2 focus:outline-none focus:border-primary text-body-md text-primary placeholder:text-outline-variant transition-colors";
const labelClass = "text-label-uppercase text-primary block uppercase";

// "clientName" diambil otomatis dari akun client yang lagi login — makanya di
// form ini gak ada lagi field "nama" (namanya udah ketauan, gak perlu diisi).
export function InquiryForm({ clientName }: { clientName?: string }) {
  const [createInquiry, { isLoading }] = useCreateInquiryMutation();

  // Talent yang dipilih dari halaman detail talent (dibawa lewat RTK). Dipakai
  // sekali untuk pre-fill, lalu draft-nya dibersihkan biar gak nyangkut di
  // kunjungan berikutnya.
  const dispatch = useAppDispatch();
  const inquiryTalent = useAppSelector((s) => s.ui.inquiryTalent);

  const [noTelepon, setNoTelepon] = useState("");
  const [judulProject, setJudulProject] = useState("");
  const [brand, setBrand] = useState("");
  const [jenisJob, setJenisJob] = useState("");
  const [tanggalProject, setTanggalProject] = useState("");
  const [modelPilihan, setModelPilihan] = useState(inquiryTalent ?? "");
  const [catatanClient, setCatatanClient] = useState("");

  useEffect(() => {
    if (inquiryTalent) dispatch(setInquiryTalent(null));
  }, [inquiryTalent, dispatch]);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    if (!jenisJob) {
      setError("Please select a job type first.");
      return;
    }

    try {
      await createInquiry({
        // Nama dikirim diam-diam dari akun yang login, bukan dari input.
        namaClient: clientName ?? "",
        noTelepon,
        judulProject,
        brand: brand || undefined,
        jenisJob,
        tanggalProject: tanggalProject || undefined,
        modelPilihan: modelPilihan || undefined,
        catatanClient: catatanClient || undefined,
      }).unwrap();

      // Reset field project, nomor telepon dibiarin biar gampang ajuin lagi.
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
            "Failed to send your inquiry. Please try again.")
          : "Failed to send your inquiry. Please try again.";
      setError(message);
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
      <div className="space-y-1">
        <label htmlFor="inq-phone" className={labelClass}>
          PHONE NUMBER
        </label>
        <input
          id="inq-phone"
          type="tel"
          required
          value={noTelepon}
          onChange={(e) => setNoTelepon(e.target.value)}
          placeholder="0812-xxxx-xxxx"
          className={inputClass}
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="inq-title" className={labelClass}>
          PROJECT TITLE
        </label>
        <input
          id="inq-title"
          type="text"
          required
          value={judulProject}
          onChange={(e) => setJudulProject(e.target.value)}
          placeholder="e.g. Spring Editorial Campaign"
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label htmlFor="inq-brand" className={labelClass}>
            BRAND / COMPANY
          </label>
          <input
            id="inq-brand"
            type="text"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="Optional"
            className={inputClass}
          />
        </div>
        <div className="space-y-1 relative">
          <label htmlFor="inq-jobtype" className={labelClass}>
            JOB TYPE
          </label>
          <select
            id="inq-jobtype"
            required
            value={jenisJob}
            onChange={(e) => setJenisJob(e.target.value)}
            className={`${inputClass} appearance-none rounded-none cursor-pointer pr-8`}
          >
            <option value="" disabled>
              Select a job type
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
        <label htmlFor="inq-date" className={labelClass}>
          PROJECT DATE / TIMELINE
        </label>
        <input
          id="inq-date"
          type="date"
          value={tanggalProject}
          onChange={(e) => setTanggalProject(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="inq-talent" className={labelClass}>
          PREFERRED MODEL / TALENT
        </label>
        <textarea
          id="inq-talent"
          rows={2}
          value={modelPilihan}
          onChange={(e) => setModelPilihan(e.target.value)}
          placeholder="Name the talent you want, or describe your talent needs"
          className={`${inputClass} resize-none`}
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="inq-notes" className={labelClass}>
          ADDITIONAL NOTES
        </label>
        <textarea
          id="inq-notes"
          rows={3}
          value={catatanClient}
          onChange={(e) => setCatatanClient(e.target.value)}
          placeholder="Add any notes to clarify your request"
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
          Inquiry sent, track its status below.
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary text-on-primary text-label-uppercase py-4 px-8 hover:bg-accent transition-colors uppercase disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "SENDING…" : "SEND PROJECT BRIEF"}
      </button>
    </form>
  );
}
