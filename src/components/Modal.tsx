"use client";

import { useEffect } from "react";

/**
 * Dialog yang dikontrol penuh lewat props (open/onClose) — sengaja
 * tidak menyimpan state sendiri supaya pemanggil bebas menyetirnya dari RTK.
 * Menutup lewat tombol ✕, klik backdrop, atau tombol Escape; selama terbuka,
 * scroll body dikunci agar fokus tetap di dalam dialog.
 */
export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  // Escape menutup + kunci scroll body selama dialog hidup.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-primary/40 p-4 md:p-8"
      onClick={onClose}
    >
      {/* Panel — klik di dalam tidak menutup (stopPropagation). */}
      <div
        className="relative w-full max-w-2xl my-auto bg-background border border-outline-variant"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b border-outline-variant px-6 py-5 md:px-8">
          <h2 className="font-display text-headline-md text-primary uppercase leading-none">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 inline-flex items-center justify-center w-10 h-10 border border-outline-variant text-primary hover:bg-primary hover:text-on-primary transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path strokeLinecap="square" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-7 md:px-8">{children}</div>
      </div>
    </div>
  );
}
