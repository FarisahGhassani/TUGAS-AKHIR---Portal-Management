"use client";

import { useAppDispatch } from "@/store/hooks";
import { openRegModal } from "@/store/slices/uiSlice";

/**
 * Kartu pendaftaran yang berdiri sendiri — seluruh kartu bisa diklik untuk
 * membuka modal form (jenis = panelKey). `title` adalah judul highlight singkat
 * (mis. "APPLY AS TALENT") yang jadi kepala kartu; `heading` + `body` di
 * bawahnya sebagai deskripsi. Aksen edgy-nya cukup satu: panah diagonal besar
 * di pojok kanan atas. State modal disetir lewat RTK (ui slice).
 */
export function RegistrationCard({
  panelKey,
  title,
  heading,
  body,
}: {
  panelKey: "talent" | "kelas";
  title: string;
  heading: string;
  body: string;
}) {
  const dispatch = useAppDispatch();

  return (
    <button
      type="button"
      onClick={() => dispatch(openRegModal(panelKey))}
      className="group relative flex h-full flex-col text-left border border-primary bg-primary p-7 md:p-9 transition-colors hover:border-accent focus:outline-none focus-visible:border-accent"
    >
      {/* Satu panah diagonal besar — penanda edgy di pojok kanan atas. */}
      <span
        aria-hidden="true"
        className="absolute top-6 right-6 md:top-7 md:right-7 text-on-primary transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="52"
          height="52"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
        >
          <path strokeLinecap="square" d="M7 17L17 7M17 7H8M17 7V16" />
        </svg>
      </span>

      {/* Judul highlight — kepala kartu, font display biar menonjol. */}
      <h3 className="font-display text-headline-md text-on-primary uppercase leading-none tracking-tight pr-16">
        {title}
      </h3>
      {/* Deskripsi: tagline + body (tidak dihapus, cuma jadi sekunder). */}
      <p className="text-body-lg font-medium text-on-primary/90 mt-4 leading-snug pr-8">
        {heading}
      </p>
      <p className="text-body-md text-on-primary/70 mt-3 max-w-prose">{body}</p>
    </button>
  );
}
