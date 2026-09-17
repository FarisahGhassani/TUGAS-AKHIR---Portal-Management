"use client";

import { useSyncExternalStore } from "react";
import { Provider } from "react-redux";
import { store } from "./index";
import { bacaSesi } from "./simpananSesi";
import { setCredentials } from "./slices/authSlice";
import { SessionToast } from "@/components/SessionToast";

// Pulihkan sesi (localStorage) SEKALI, sebelum React merender apa pun di klien.
// Dengan begitu store sudah berisi user yang benar sejak render pertama —
// navbar tidak sempat tampil "guest" (LOGIN) lalu meloncat ke "logged-in".
// bacaSesi() sendiri aman di server: ia memulangkan null bila window belum ada.
if (typeof window !== "undefined") {
  const sesi = bacaSesi();
  if (sesi) store.dispatch(setCredentials(sesi));
}

// Gerbang hidrasi tanpa useEffect: server dan render pertama klien sama-sama
// memulangkan false (layar "Initializing"), render berikutnya di klien true.
// Jadi tidak ada hydration mismatch, dan tidak ada setState di dalam effect.
const langgananKosong = () => () => {};
const diKlien = () => true;
const diServer = () => false;

export function Providers({ children }: { children: React.ReactNode }) {
  const siap = useSyncExternalStore(langgananKosong, diKlien, diServer);

  if (!siap) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <p className="portal-loader-word text-label-uppercase text-secondary uppercase tracking-[0.25em]">
          Portal Management
        </p>
        <span className="portal-loader-bar" aria-hidden="true" />
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
