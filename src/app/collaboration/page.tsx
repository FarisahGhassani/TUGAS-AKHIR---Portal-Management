"use client";

import Link from "next/link";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { InquiryForm } from "@/components/collaboration/InquiryForm";
import { InquiryList } from "@/components/collaboration/InquiryList";
import { useAppSelector } from "@/store/hooks";

export default function CollaborationPage() {
  const user = useAppSelector((s) => s.auth.user);
  const isClient = user?.role === "client";

  return (
    <>
      <NavBar />
      <main className="flex-grow">
        {!isClient ? (
          <AccessNotice loggedIn={Boolean(user)} />
        ) : (
          <>
            {/* Hero */}
            <section className="w-full pt-10 md:pt-16 px-margin-mobile md:px-margin-desktop max-w-editorial mx-auto">
              <p className="text-label-uppercase text-secondary uppercase mb-4">
                CLIENT COLLABORATION
              </p>
              <h1 className="font-display text-headline-lg-mobile md:text-headline-lg text-primary uppercase leading-[0.95]">
                LET&apos;S COLLABORATE
              </h1>
              <p className="text-body-lg text-secondary max-w-prose mt-6">
                Ajukan project brief Anda ke Portal Management dan pantau
                statusnya — dari{" "}
                <span className="text-primary">Baru</span> →{" "}
                <span className="text-primary">Diproses</span> →{" "}
                <span className="text-primary">Selesai</span> — langsung dari
                satu halaman.
              </p>
            </section>

            <section className="px-margin-mobile md:px-margin-desktop pt-section pb-section max-w-editorial mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-gutter">
                {/* Pengajuan project brief */}
                <div>
                  <div className="flex justify-between items-end mb-8 border-b border-outline-variant pb-4">
                    <h2 className="font-display text-headline-md text-primary uppercase">
                      NEW PROJECT BRIEF
                    </h2>
                  </div>
                  <InquiryForm defaultName={user?.name} />
                </div>

                {/* Pemantauan status inquiry */}
                <div>
                  <div className="flex justify-between items-end mb-8 border-b border-outline-variant pb-4">
                    <h2 className="font-display text-headline-md text-primary uppercase">
                      YOUR INQUIRIES
                    </h2>
                  </div>
                  <InquiryList />
                </div>
              </div>
            </section>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}

function AccessNotice({ loggedIn }: { loggedIn: boolean }) {
  return (
    <section className="px-margin-mobile md:px-margin-desktop py-section max-w-editorial mx-auto">
      <p className="text-label-uppercase text-secondary uppercase mb-4">
        CLIENT COLLABORATION
      </p>
      <h1 className="font-display text-headline-lg-mobile md:text-headline-lg text-primary uppercase leading-[0.95] mb-6">
        KHUSUS AKUN CLIENT
      </h1>
      <p className="text-body-lg text-secondary max-w-prose mb-10">
        {loggedIn
          ? "Halaman ini hanya untuk akun dengan role Client. Silakan masuk menggunakan akun client untuk mengajukan dan memantau inquiry."
          : "Masuk atau daftar sebagai Client untuk mengajukan project brief dan memantau status kerja sama Anda dengan agency."}
      </p>
      <Link
        href="/auth"
        className="inline-block text-label-uppercase text-on-primary bg-primary px-8 py-4 hover:opacity-70 transition-opacity uppercase"
      >
        {loggedIn ? "GANTI KE AKUN CLIENT" : "LOGIN / DAFTAR SEBAGAI CLIENT"}
      </Link>
    </section>
  );
}
