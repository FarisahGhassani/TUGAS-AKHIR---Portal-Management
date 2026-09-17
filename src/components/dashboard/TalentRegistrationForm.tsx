"use client";

import { useState } from "react";
import { useCreateApplicationMutation } from "@/store/api/dashboardApi";
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

/**
 * Form pendaftaran TALENT — menulis ke tabel PENDAFTARAN (jenis = talent) milik
 * user yang login (status awal pending). Foto profil WAJIB; portfolio opsional
 * (boleh kosong / null di DB). Setelah submit, form diganti panel terima kasih.
 */
export function TalentRegistrationForm({ onClose }: { onClose: () => void }) {
  const [createApplication, { isLoading }] = useCreateApplicationMutation();
  const userId = useAppSelector((s) => s.auth.user?.id);

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
  // Portofolio kini berupa tautan (opsional) — bukan berkas yang diunggah.
  const [portofolioUrl, setPortofolioUrl] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function validate(): string | null {
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
    // Portofolio boleh kosong; kalau diisi, minimal harus berbentuk tautan
    // (skema https:// ditambahkan di server bila pengguna tidak menulisnya).
    const porto = portofolioUrl.trim();
    if (porto && !/^(https?:\/\/)?[\w-]+(\.[\w-]+)+\/?/i.test(porto))
      return "Enter a valid portfolio link (e.g. drive.google.com/…).";
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
        jenis: "talent",
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
        portofolioUrl: portofolioUrl.trim() || undefined,
      }).unwrap();
      setSubmitted(true);
    } catch (err) {
      setError(
        err && typeof err === "object" && "data" in err
          ? ((err as { data?: { message?: string } }).data?.message ??
              "Failed to submit. Please try again.")
          : "Failed to submit. Please try again.",
      );
    }
  }

  if (submitted) {
    return <SubmissionThankYou onAction={onClose} />;
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-1 md:col-span-2">
          <label htmlFor="t-nama" className={labelClass}>
            FULL NAME
          </label>
          <input
            id="t-nama"
            type="text"
            value={namaTalent}
            onChange={(e) => setNamaTalent(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="space-y-1 relative">
          <label htmlFor="t-gender" className={labelClass}>
            GENDER
          </label>
          <select
            id="t-gender"
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
          <label htmlFor="t-dob" className={labelClass}>
            DATE OF BIRTH
          </label>
          <input
            id="t-dob"
            type="date"
            value={tanggalLahir}
            onChange={(e) => setTanggalLahir(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="t-phone" className={labelClass}>
            PHONE NUMBER
          </label>
          <input
            id="t-phone"
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
          <label htmlFor="t-height" className={labelClass}>
            HEIGHT
          </label>
          <UnitInput
            id="t-height"
            value={tinggiBadan}
            onChange={setTinggiBadan}
            unit="Cm"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="t-weight" className={labelClass}>
            WEIGHT
          </label>
          <UnitInput
            id="t-weight"
            value={beratBadan}
            onChange={setBeratBadan}
            unit="Kg"
          />
        </div>
        <div className="space-y-1 relative">
          <label htmlFor="t-baju" className={labelClass}>
            CLOTHING
          </label>
          <select
            id="t-baju"
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
          <label htmlFor="t-sepatu" className={labelClass}>
            SHOE
          </label>
          {/* Cukup ukuran EU; UK dihitung otomatis di API saat ditampilkan. */}
          <UnitInput
            id="t-sepatu"
            value={sizeSepatu}
            onChange={setSizeSepatu}
            unit="EU"
            placeholder="e.g. 40"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label htmlFor="t-ktp" className={labelClass}>
            ID CARD (KTP) NUMBER
          </label>
          <input
            id="t-ktp"
            type="text"
            value={kartuIdentitas}
            onChange={(e) => setKartuIdentitas(e.target.value)}
            placeholder="National ID number"
            className={inputClass}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="t-ig" className={labelClass}>
            INSTAGRAM
          </label>
          <input
            id="t-ig"
            type="text"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="@portfolio or personal"
            className={inputClass}
          />
          <p className="text-caption text-outline">
            Portfolio or personal account — clients use this to reach you.
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

      {/* Portofolio = LINK, bukan berkas: ringan di DB dan tim kami selalu
          melihat versi terbaru yang kamu update sendiri. */}
      <div className="space-y-1">
        <label htmlFor="t-porto" className={labelClass}>
          PORTFOLIO LINK <span className="text-secondary">(optional)</span>
        </label>
        <input
          id="t-porto"
          type="url"
          inputMode="url"
          value={portofolioUrl}
          onChange={(e) => setPortofolioUrl(e.target.value)}
          placeholder="drive.google.com/… or instagram.com/…"
          className={inputClass}
        />
        <p className="text-caption text-outline">
          Attach a portfolio link — Google Drive, Instagram, or any online
          documentation. Leave empty if you don&apos;t have one.
        </p>
      </div>

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
        {isLoading ? "SUBMITTING…" : "SUBMIT TALENT APPLICATION"}
      </button>
    </form>
  );
}
