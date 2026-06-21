"use client";

import { useId, useRef, useState } from "react";

export type PickedFile = { name: string; type: string; dataUrl: string };

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
  value,
  onChange,
}: {
  label: string;
  accept: string; // e.g. "image/*" or "image/*,application/pdf"
  maxSizeMB?: number;
  optional?: boolean;
  value: PickedFile | null;
  onChange: (file: PickedFile | null) => void;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  function matchesAccept(file: File): boolean {
    return accept.split(",").some((raw) => {
      const a = raw.trim().toLowerCase();
      if (!a) return false;
      if (a.endsWith("/*")) return file.type.startsWith(a.slice(0, -1));
      if (a.startsWith(".")) return file.name.toLowerCase().endsWith(a);
      return file.type === a;
    });
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
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
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File must be under ${maxSizeMB}MB.`);
      onChange(null);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => setError("Could not read the file. Try again.");
    reader.onload = () =>
      onChange({ name: file.name, type: file.type, dataUrl: String(reader.result) });
    reader.readAsDataURL(file);
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
          className="inline-flex items-center gap-2 border border-outline px-4 py-2 text-label-uppercase uppercase text-primary cursor-pointer hover:border-accent hover:text-accent transition-colors"
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
          Choose file
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

      {error && (
        <p className="text-caption text-error uppercase tracking-[0.1em]">
          {error}
        </p>
      )}
    </div>
  );
}
