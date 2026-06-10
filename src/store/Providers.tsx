"use client";

import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { store } from "./index";

const isMockEnabled = process.env.NODE_ENV === "development";

export function Providers({ children }: { children: React.ReactNode }) {
  const [mocksReady, setMocksReady] = useState(!isMockEnabled);

  useEffect(() => {
    if (!isMockEnabled) return;
    let cancelled = false;
    (async () => {
      const { worker } = await import("@/mocks/browser");
      await worker.start({
        onUnhandledRequest: "bypass",
        serviceWorker: { url: "/mockServiceWorker.js" },
      });
      if (!cancelled) setMocksReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!mocksReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-on-surface-variant text-label-uppercase uppercase tracking-[0.15em]">
        Initializing portal…
      </div>
    );
  }

  return <Provider store={store}>{children}</Provider>;
}
