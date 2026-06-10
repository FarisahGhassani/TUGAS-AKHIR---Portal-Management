"use client";

import { useState } from "react";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

type Tab = "login" | "register";

export function AuthCard() {
  const [tab, setTab] = useState<Tab>("login");
  // "Forgot password" is a sub-view of the login tab.
  const [showForgot, setShowForgot] = useState(false);

  function selectTab(next: Tab) {
    setTab(next);
    setShowForgot(false);
  }

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
        {tab === "register" && <RegisterForm />}
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
          : "bg-transparent text-secondary hover:text-primary"
      }`}
    >
      {children}
    </button>
  );
}
