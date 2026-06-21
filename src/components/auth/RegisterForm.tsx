"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRegisterMutation } from "@/store/api/authApi";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/slices/authSlice";
import { tujuanSetelahLogin } from "@/lib/navigasiRole";

// "intent" = niat user pas dateng dari tombol di landing:
//   "agency" → mau gabung jadi talent, "class" → mau ikut kelas modelling.
// Dua-duanya tetap butuh akun talent, jadi kalau ada intent ini, role-nya
// langsung kita preselect "talent" biar user gak perlu milih lagi.
export type AuthIntent = "agency" | "class" | null;

export function RegisterForm({ intent }: { intent?: AuthIntent }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [register, { isLoading }] = useRegisterMutation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"talent" | "client" | "">(
    intent ? "talent" : "",
  );
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!role) {
      setError("Please select an option.");
      return;
    }
    try {
      const result = await register({ name, email, password, role }).unwrap();
      dispatch(setCredentials(result));
      router.push(tujuanSetelahLogin(result.user.role));
    } catch (err) {
      const message =
        err && typeof err === "object" && "data" in err
          ? ((err as { data?: { message?: string } }).data?.message ??
            "Unable to create account.")
          : "Unable to create account.";
      setError(message);
    }
  }

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <h2 className="font-display text-headline-lg-mobile md:text-headline-lg text-primary uppercase">
          CREATE ACCOUNT
        </h2>
        <p className="text-body-md text-secondary">
          {intent === "class"
            ? "Create your talent account to enroll in modelling classes."
            : intent === "agency"
              ? "Create your talent account to join the agency roster."
              : "For aspiring talent and casting clients alike."}
        </p>
      </header>
      <form className="space-y-6" onSubmit={handleSubmit} noValidate>
        <div className="space-y-1">
          <label
            htmlFor="reg-name"
            className="text-label-uppercase text-primary block uppercase"
          >
            FULL NAME
          </label>
          <input
            id="reg-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your fullname here..."
            className="w-full border-0 border-b border-outline bg-transparent px-0 py-2 focus:outline-none focus:border-primary text-body-md text-primary placeholder:text-outline-variant transition-colors"
          />
        </div>
        <div className="space-y-1">
          <label
            htmlFor="reg-email"
            className="text-label-uppercase text-primary block uppercase"
          >
            EMAIL
          </label>
          <input
            id="reg-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email here..."
            className="w-full border-0 border-b border-outline bg-transparent px-0 py-2 focus:outline-none focus:border-primary text-body-md text-primary placeholder:text-outline-variant transition-colors"
          />
        </div>
        <div className="space-y-1">
          <label
            htmlFor="reg-password"
            className="text-label-uppercase text-primary block uppercase"
          >
            PASSWORD
          </label>
          <input
            id="reg-password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password"
            className="w-full border-0 border-b border-outline bg-transparent px-0 py-2 focus:outline-none focus:border-primary text-body-md text-primary placeholder:text-outline-variant transition-colors"
          />
        </div>
        <div className="space-y-1 relative">
          <label
            htmlFor="reg-type"
            className="text-label-uppercase text-primary block uppercase"
          >
            Registration as
          </label>
          <select
            id="reg-type"
            required
            value={role}
            onChange={(e) =>
              setRole(e.target.value as "talent" | "client" | "")
            }
            className="w-full border-0 border-b border-outline bg-transparent px-0 py-2 focus:outline-none focus:border-primary text-body-md text-primary appearance-none rounded-none cursor-pointer transition-colors"
          >
            <option value="" disabled>
              Select an option
            </option>
            <option value="talent">Talent</option>
            <option value="client">Client</option>
          </select>
          <div className="pointer-events-none absolute right-0 bottom-2 text-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path strokeLinecap="square" d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>
        {error && (
          <p className="text-caption text-error uppercase tracking-[0.1em]">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-transparent border border-primary text-primary text-label-uppercase py-4 px-8 hover:bg-accent hover:text-on-accent hover:border-accent transition-colors flex items-center justify-center gap-2 uppercase disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "CREATING ACCOUNT…" : "CREATE ACCOUNT"}
        </button>
      </form>
    </section>
  );
}
