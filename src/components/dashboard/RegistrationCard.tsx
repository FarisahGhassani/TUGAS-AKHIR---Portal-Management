"use client";

import { useAppDispatch } from "@/store/hooks";
import { openRegModal } from "@/store/slices/uiSlice";

/**
 * Kartu pendaftaran yang berdiri sendiri — seluruh kartu bisa diklik untuk
 * membuka modal form (jenis = panelKey). Tanpa eyebrow, tanpa tombol CTA di
 * dalam, dan judul memakai font yang sama dengan body (bukan font-display).
 * Aksen edgy-nya cukup satu: panah diagonal besar di pojok kanan atas. State
 * modal disetir lewat RTK (ui slice).
 */
export function RegistrationCard({
  panelKey,
  heading,
  body,
}: {
  panelKey: "talent" | "kelas";
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

      <h3 className="text-headline-md font-semibold text-on-primary leading-tight pr-16">
        {heading}
      </h3>
      <p className="text-body-md text-on-primary/70 mt-4 max-w-prose">{body}</p>
    </button>
  );
}
