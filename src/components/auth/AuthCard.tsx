"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoginForm } from "./LoginForm";
import { RegisterForm, type AuthIntent } from "./RegisterForm";
import { ForgotPasswordForm } from "./ForgotPasswordForm";
import { useAppSelector } from "@/store/hooks";
import { tujuanSetelahLogin } from "@/lib/navigasiRole";

type Tab = "login" | "register";

// Ambil "intent" dari URL (?intent=agency / ?intent=class). Selain itu → null.
function bacaIntent(nilai: string | null): AuthIntent {
  return nilai === "agency" || nilai === "class" ? nilai : null;
}

export function AuthCard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const intent = bacaIntent(searchParams.get("intent"));

  // Kalau user UDAH login terus nyasar ke /auth (misal klik APPLY/JOIN lagi),
  // langsung lempar ke halaman sesuai role-nya — gak usah nampilin form lagi.
  const user = useAppSelector((s) => s.auth.user);
  useEffect(() => {
    if (user) router.replace(tujuanSetelahLogin(user.role));
  }, [user, router]);

  // Kalau dateng dari tombol talent (agency/class), buka tab daftar duluan.
  const [tab, setTab] = useState<Tab>(intent ? "register" : "login");
  // "Forgot password" itu sub-tampilan dari tab login.
  const [showForgot, setShowForgot] = useState(false);

  function selectTab(next: Tab) {
    setTab(next);
    setShowForgot(false);
  }

  // Lagi proses redirect (user udah login) → jangan kedip-in form dulu.
  if (user) return null;

  return (
    <div className="w-full space-y-8">
      <div
        role="tablist"
        aria-label="Authentication mode"
        className="grid grid-cols-2 border border-outline"
      >
        <TabButton
          active={tab === "login"}
          onClick={() => selectTab("login")}
          controls="auth-login-panel"
        >
          LOGIN
        </TabButton>
        <TabButton
          active={tab === "register"}
          onClick={() => selectTab("register")}
          controls="auth-register-panel"
        >
          CREATE ACCOUNT
        </TabButton>
      </div>

      <div
        id="auth-login-panel"
        role="tabpanel"
        hidden={tab !== "login"}
        aria-labelledby="auth-tab-login"
      >
        {tab === "login" &&
          (showForgot ? (
            <ForgotPasswordForm onBack={() => setShowForgot(false)} />
          ) : (
            <LoginForm onForgotPassword={() => setShowForgot(true)} />
          ))}
      </div>
      <div
        id="auth-register-panel"
        role="tabpanel"
        hidden={tab !== "register"}
        aria-labelledby="auth-tab-register"
      >
        {tab === "register" && <RegisterForm intent={intent} />}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  controls,
  children,
}: {
  active: boolean;
  onClick: () => void;
  controls: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      aria-controls={controls}
      onClick={onClick}
      className={`py-3 text-label-uppercase uppercase tracking-[0.15em] transition-colors ${
        active
          ? "bg-primary text-on-primary"
          : "bg-transparent text-secondary hover:text-accent"
      }`}
    >
      {children}
    </button>
  );
}
