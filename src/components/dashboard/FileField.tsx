"use client";

import { useId, useRef, useState } from "react";
import { processUpload } from "@/lib/processUpload";

export type PickedFile = { name: string; type: string; dataUrl: string };

// Batas aman panjang string yang boleh disimpan ke DB (di bawah `max_allowed_packet`
// MySQL/XAMPP default ±1MB). Gambar sudah dikompres jauh di bawah ini; penjaga
// ini terutama menangkap berkas non-gambar (mis. PDF) yang terlalu besar, agar
// muncul pesan jelas alih-alih error server saat menyimpan.
const SAFE_STORE_CHARS = 900_000;

/**
 * Upload field yang BENAR-BENAR memproses file: membacanya jadi data URL
 * (FileReader) sehingga bisa di-preview & dikirim, plus validasi tipe & ukuran
 * sebelum diterima. Tanpa backend nyata, "berhasil upload" dibuktikan lewat
 * preview + nama file; nilai yang dipakai form bisa data URL atau nama file.
 */
export function FileField({
  label,
  accept,
  maxSizeMB = 5,
  optional = false,
  hint,
  value,
  onChange,
}: {
  label: string;
  accept: string; // e.g. "image/*" or "image/*,application/pdf"
  maxSizeMB?: number;
  optional?: boolean;
  // Keterangan kecil opsional di bawah field (mis. anjuran jenis foto).
  hint?: string;
  value: PickedFile | null;
  onChange: (file: PickedFile | null) => void;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Field khusus gambar? (semua tipe accept adalah image/*). Kalau ya, gambar
  // dikompres otomatis sebelum disimpan, jadi batas input bisa longgar — batas
  // ini hanya mencegah file raksasa yang berat didecode di browser. Field lain
  // (mis. PDF) tetap pakai maxSizeMB apa adanya.
  const imageOnly = accept
    .split(",")
    .filter(Boolean)
    .every((a) => a.trim().toLowerCase().startsWith("image/"));
  const inputLimitMB = imageOnly ? Math.max(maxSizeMB, 15) : maxSizeMB;

  function matchesAccept(file: File): boolean {
    return accept.split(",").some((raw) => {
      const a = raw.trim().toLowerCase();
      if (!a) return false;
      if (a.endsWith("/*")) return file.type.startsWith(a.slice(0, -1));
      if (a.startsWith(".")) return file.name.toLowerCase().endsWith(a);
      return file.type === a;
    });
  }

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setError(null);
    if (!file) {
      onChange(null);
      return;
    }
    if (!matchesAccept(file)) {
      setError("Unsupported file type.");
      onChange(null);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    if (file.size > inputLimitMB * 1024 * 1024) {
      setError(`File must be under ${inputLimitMB}MB.`);
      onChange(null);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    // Gambar dikompres agar aman disimpan (base64 kecil); berkas lain apa adanya.
    setBusy(true);
    try {
      const { dataUrl, type } = await processUpload(file);
      if (dataUrl.length > SAFE_STORE_CHARS) {
        // Praktis hanya kena berkas non-gambar (mis. PDF) yang terlalu besar.
        setError(
          "File terlalu besar untuk disimpan. Gunakan berkas yang lebih kecil (± di bawah 1MB).",
        );
        onChange(null);
        if (inputRef.current) inputRef.current.value = "";
        return;
      }
      onChange({ name: file.name, type, dataUrl });
    } catch {
      setError("Could not read the file. Try again.");
      onChange(null);
      if (inputRef.current) inputRef.current.value = "";
    } finally {
      setBusy(false);
    }
  }

  function clear() {
    onChange(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  const isImage = value?.type.startsWith("image/");

  return (
    <div className="space-y-2">
      <span className="text-label-uppercase text-primary block uppercase">
        {label}{" "}
        {optional && <span className="text-secondary">(optional)</span>}
      </span>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="sr-only"
      />

      {!value ? (
        <label
          htmlFor={inputId}
          aria-busy={busy}
          className={`inline-flex items-center gap-2 border border-outline px-4 py-2 text-label-uppercase uppercase text-primary transition-colors ${
            busy
              ? "opacity-60 cursor-wait pointer-events-none"
              : "cursor-pointer hover:border-accent hover:text-accent"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path strokeLinecap="square" d="M12 16V4M6 10l6-6 6 6M4 20h16" />
          </svg>
          {busy ? "Processing…" : "Choose file"}
        </label>
      ) : (
        <div className="flex items-center gap-3 border border-outline-variant p-2">
          {isImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value.dataUrl}
              alt={value.name}
              className="h-12 w-12 object-cover grayscale"
            />
          ) : (
            <span className="flex h-12 w-12 items-center justify-center bg-surface-container text-label-uppercase text-secondary uppercase">
              FILE
            </span>
          )}
          <span className="flex-1 text-body-md text-primary truncate">
            {value.name}
          </span>
          {/* Ganti file: pakai file input yang sama tanpa harus hapus dulu, agar
              gambar lama tak "hilang" saat admin ingin menggantinya (mode edit). */}
          <label
            htmlFor={inputId}
            aria-busy={busy}
            className={`text-label-uppercase uppercase text-primary transition-colors px-2 ${
              busy
                ? "opacity-60 cursor-wait pointer-events-none"
                : "cursor-pointer hover:text-accent"
            }`}
          >
            {busy ? "…" : "Ganti"}
          </label>
          <button
            type="button"
            onClick={clear}
            aria-label="Remove file"
            className="text-secondary hover:text-error transition-colors px-1"
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
              <path strokeLinecap="square" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
      )}

      {/* Keterangan selalu tampil: anjuran (opsional) + info ukuran. Gambar
          dioptimalkan otomatis, jadi tak perlu takut ukuran sumber. */}
      <p className="text-caption text-secondary tracking-[0.08em]">
        {hint ? `${hint} · ` : ""}
        {imageOnly
          ? `Gambar dioptimalkan otomatis (maks ${inputLimitMB}MB)`
          : `Maks ${maxSizeMB}MB`}
      </p>

      {error && (
        <p className="text-caption text-error uppercase tracking-[0.1em]">
          {error}
        </p>
      )}
    </div>
  );
}
