"use client";

import { useState } from "react";
import { useCreateApplicationMutation } from "@/store/api/dashboardApi";
import { useAppSelector } from "@/store/hooks";
import { FileField, type PickedFile } from "./FileField";

const inputClass =
  "w-full border-0 border-b border-outline bg-transparent px-0 py-2 focus:outline-none focus:border-primary text-body-md text-primary placeholder:text-outline-variant transition-colors";
const labelClass = "text-label-uppercase text-primary block uppercase";

/**
 * Form pendaftaran TALENT — field mengikuti tabel PENDAFTARAN (jenis = talent)
 * di PRD. Upload foto diproses & divalidasi oleh FileField; sisanya divalidasi
 * di sini sebelum dikirim lewat RTK mutation ke store pendaftaran yang sama.
 */
export function TalentRegistrationForm() {
  const [createApplication, { isLoading }] = useCreateApplicationMutation();
  const userName = useAppSelector((s) => s.auth.user?.name);

  const [namaTalent, setNamaTalent] = useState(userName ?? "");
  const [tanggalLahir, setTanggalLahir] = useState("");
  const [tinggiBadan, setTinggiBadan] = useState("");
  const [beratBadan, setBeratBadan] = useState("");
  const [sizeBaju, setSizeBaju] = useState("");
  const [sizeSepatu, setSizeSepatu] = useState("");
  const [kartuIdentitas, setKartuIdentitas] = useState("");
  const [noTelepon, setNoTelepon] = useState("");
  const [fotoProfil, setFotoProfil] = useState<PickedFile | null>(null);
  const [fotoPortofolio, setFotoPortofolio] = useState<PickedFile | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
    if (!fotoProfil) return "Please attach a profile photo.";
    return null;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccess(false);
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);

    try {
      await createApplication({
        jenis: "talent",
        namaTalent: namaTalent.trim(),
        tanggalLahir,
        tinggiBadan: Number(tinggiBadan),
        beratBadan: Number(beratBadan),
        sizeBaju: sizeBaju.trim(),
        sizeSepatu: sizeSepatu.trim(),
        kartuIdentitas: kartuIdentitas.trim(),
        noTelepon: noTelepon.trim(),
        fotoProfil: fotoProfil?.name,
        fotoPortofolio: fotoPortofolio?.name,
      }).unwrap();
      setTanggalLahir("");
      setTinggiBadan("");
      setBeratBadan("");
      setSizeBaju("");
      setSizeSepatu("");
      setKartuIdentitas("");
      setFotoProfil(null);
      setFotoPortofolio(null);
      setSuccess(true);
    } catch (err) {
      setError(
        err && typeof err === "object" && "data" in err
          ? ((err as { data?: { message?: string } }).data?.message ??
              "Failed to submit. Please try again.")
          : "Failed to submit. Please try again.",
      );
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
      <div className="space-y-1">
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
            HEIGHT (CM)
          </label>
          <input
            id="t-height"
            type="number"
            min={1}
            value={tinggiBadan}
            onChange={(e) => setTinggiBadan(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="t-weight" className={labelClass}>
            WEIGHT (KG)
          </label>
          <input
            id="t-weight"
            type="number"
            min={1}
            value={beratBadan}
            onChange={(e) => setBeratBadan(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="t-baju" className={labelClass}>
            CLOTHING
          </label>
          <input
            id="t-baju"
            type="text"
            value={sizeBaju}
            onChange={(e) => setSizeBaju(e.target.value)}
            placeholder="e.g. M"
            className={inputClass}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="t-sepatu" className={labelClass}>
            SHOE
          </label>
          <input
            id="t-sepatu"
            type="text"
            value={sizeSepatu}
            onChange={(e) => setSizeSepatu(e.target.value)}
            placeholder="e.g. 40"
            className={inputClass}
          />
        </div>
      </div>

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

      <FileField
        label="PROFILE PHOTO"
        accept="image/*"
        value={fotoProfil}
        onChange={setFotoProfil}
      />

      <FileField
        label="PORTFOLIO"
        accept="image/*,application/pdf"
        optional
        value={fotoPortofolio}
        onChange={setFotoPortofolio}
      />

      {error && (
        <p className="text-caption text-error uppercase tracking-[0.1em]">
          {error}
        </p>
      )}
      {success && (
        <p className="text-caption text-primary uppercase tracking-[0.1em]">
          Talent application submitted. Track its status in your history below.
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
