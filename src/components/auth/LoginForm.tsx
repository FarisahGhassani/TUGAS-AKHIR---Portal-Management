"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLoginMutation } from "@/store/api/authApi";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/slices/authSlice";

export function LoginForm({
  onForgotPassword,
}: {
  onForgotPassword: () => void;
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    try {
      const result = await login({ email, password }).unwrap();
      dispatch(setCredentials(result));
      const destination =
        result.user.role === "admin"
          ? "/admin"
          : result.user.role === "talent"
            ? "/dashboard"
            : "/talent";
      router.push(destination);
    } catch (err) {
      const message =
        err && typeof err === "object" && "data" in err
          ? ((err as { data?: { message?: string } }).data?.message ??
            "Unable to sign in.")
          : "Unable to sign in.";
      setError(message);
    }
  }

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <h2 className="font-display text-headline-lg-mobile md:text-headline-lg text-primary uppercase">
          LOGIN
        </h2>
        <p className="text-body-md text-secondary">
          Login to your account, or create one to get started
        </p>
      </header>
      <form className="space-y-6" onSubmit={handleSubmit} noValidate>
        <div className="space-y-1">
          <label
            htmlFor="login-email"
            className="text-label-uppercase text-primary block uppercase"
          >
            EMAIL
          </label>
          <input
            id="login-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email here..."
            className="w-full border-0 border-b border-outline bg-transparent px-0 py-2 focus:outline-none focus:border-primary text-body-md text-primary placeholder:text-outline-variant transition-colors"
          />
        </div>
        <div className="space-y-1">
          <div className="flex justify-between items-baseline">
            <label
              htmlFor="login-password"
              className="text-label-uppercase text-primary uppercase"
            >
              PASSWORD
            </label>
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-caption text-secondary hover:text-primary underline decoration-1 underline-offset-4 transition-colors"
            >
              Forgot password?
            </button>
          </div>
          <input
            id="login-password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full border-0 border-b border-outline bg-transparent px-0 py-2 focus:outline-none focus:border-primary text-body-md text-primary placeholder:text-outline-variant transition-colors"
          />
        </div>
        {error && (
          <p className="text-caption text-error uppercase tracking-[0.1em]">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary text-on-primary text-label-uppercase py-4 px-8 hover:opacity-70 transition-opacity flex items-center justify-center gap-2 uppercase disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "AUTHENTICATING…" : "LOGIN"}
          {!isLoading && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path strokeLinecap="square" d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          )}
        </button>
      </form>
    </section>
  );
}
