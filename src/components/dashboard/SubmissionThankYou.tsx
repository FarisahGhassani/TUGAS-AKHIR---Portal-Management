"use client";

// Konfirmasi singkat yang menggantikan form setelah pengajuan terkirim.
// Copy default berbahasa Inggris (sisi user). `action` menutup modal (talent/
// class) atau mereset form untuk mengirim lagi (inquiry inline).
export function SubmissionThankYou({
  message = "We've received your submission. Track its status under Application History on your dashboard.",
  actionLabel = "View Status",
  onAction,
}: {
  message?: string;
  actionLabel?: string;
  onAction: () => void;
}) {
  return (
    <div className="flex flex-col items-center text-center gap-4 py-6">
      <span className="flex h-14 w-14 items-center justify-center border border-primary text-primary">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <path strokeLinecap="square" d="M5 13l4 4L19 7" />
        </svg>
      </span>
      <h3 className="font-display text-headline-md text-primary uppercase">
        Thank You for Submitting
      </h3>
      <p className="text-body-md text-secondary max-w-sm">{message}</p>
      <button
        type="button"
        onClick={onAction}
        className="mt-2 bg-primary text-on-primary text-label-uppercase py-3 px-10 hover:bg-accent transition-colors uppercase"
      >
        {actionLabel}
      </button>
    </div>
  );
}
