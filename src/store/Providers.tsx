"use client";

import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { store } from "./index";
import { bacaSesi } from "./simpananSesi";
import { setCredentials } from "./slices/authSlice";
import { SessionToast } from "@/components/SessionToast";

const isMockEnabled = process.env.NODE_ENV === "development";

export function Providers({ children }: { children: React.ReactNode }) {
  // Tahan render sampai sesi (localStorage) dipulihkan DAN mocks siap.
  // Kalau app dirender sebelum sesi pulih, navbar sempat tampil "guest" (LOGIN)
  // lalu loncat ke "logged-in" (LOGOUT) — itu keanehan yang dilaporkan. Dengan
  // gerbang ini anak komponen baru muncul setelah auth state benar: tidak ada
  // flash, dan tidak ada hydration mismatch (server & first client render
  // sama-sama menampilkan layar "Initializing").
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sesi = bacaSesi();
    if (sesi) {
      store.dispatch(setCredentials(sesi));
    }

    let cancelled = false;
    (async () => {
      if (isMockEnabled) {
        const { worker } = await import("@/mocks/browser");
        await worker.start({
          onUnhandledRequest: "bypass",
          serviceWorker: { url: "/mockServiceWorker.js" },
        });
      }
      if (!cancelled) setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-on-surface-variant text-label-uppercase uppercase tracking-[0.15em]">
        Initializing portal…
      </div>
    );
  }

  return (
    <Provider store={store}>
      {children}
      <SessionToast />
    </Provider>
  );
}
