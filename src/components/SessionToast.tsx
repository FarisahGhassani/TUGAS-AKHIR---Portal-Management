"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { openSessionToast, closeSessionToast } from "@/store/slices/uiSlice";
import type { AuthRole } from "@/store/api/authApi";

const roleLabel: Record<AuthRole, string> = {
  talent: "Talent",
  client: "Client",
  admin: "Admin",
};

/**
 * Small toast that greets the signed-in user and states their role. Visibility
 * lives in the RTK `ui` slice; it pops whenever a session becomes active (login
 * or a restored session on load) and auto-dismisses after a few seconds.
 */
export function SessionToast() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const open = useAppSelector((s) => s.ui.sessionToastOpen);

  // Re-trigger only when the actual account changes (login / switch / restore),
  // not on every client-side navigation.
  useEffect(() => {
    if (!user) return;
    dispatch(openSessionToast());
    const id = window.setTimeout(() => dispatch(closeSessionToast()), 6000);
    return () => window.clearTimeout(id);
    // Re-run only on account change (id), not on every `user` object identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, dispatch]);

  if (!open || !user) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-[100] max-w-xs border border-outline-variant bg-background/90 backdrop-blur-md shadow-lg px-5 py-4 flex items-start gap-3"
    >
      <span className="mt-1 inline-block h-2 w-2 shrink-0 bg-accent" aria-hidden="true" />
      <p className="text-body-md text-primary pr-4">
        Hi <span className="font-medium">{user.name}</span>, you are currently
        logged in as a {roleLabel[user.role]}.
      </p>
      <button
        type="button"
        onClick={() => dispatch(closeSessionToast())}
        aria-label="Dismiss"
        className="absolute top-2 right-2 text-secondary hover:text-primary transition-colors"
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
  );
}
