import { Suspense } from "react";
import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthAsideImage } from "@/components/auth/AuthAsideImage";

export const metadata = {
  title: "PORTAL MANAGEMENT · Authentication",
  description:
    "Access the Portal Management talent and client portal, or create a new account.",
};

export default function AuthPage() {
  return (
    <main className="flex flex-col md:flex-row h-screen overflow-hidden">
      <div className="w-full md:w-1/2 h-48 md:h-screen relative bg-surface-container shrink-0">
        <AuthAsideImage />
        <div className="absolute inset-0 bg-primary/20 mix-blend-multiply" />
        <div className="absolute top-margin-mobile md:top-margin-desktop left-margin-mobile md:left-margin-desktop">
          <Link
            href="/"
            className="font-display text-headline-md tracking-tight text-on-primary uppercase hover:opacity-80 transition-opacity"
          >
            PORTAL MANAGEMENT
          </Link>
        </div>
      </div>

      <div className="w-full md:w-1/2 flex-1 md:flex-none md:h-screen flex items-center justify-center px-margin-mobile md:px-margin-desktop py-8 bg-background overflow-y-auto">
        <div className="max-w-md mx-auto w-full">
          {/* useSearchParams (baca ?intent=...) wajib dibungkus Suspense di App Router. */}
          <Suspense fallback={null}>
            <AuthCard />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
