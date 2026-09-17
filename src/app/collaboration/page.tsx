"use client";

import { useEffect, useRef, useState } from "react";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { InquiryForm } from "@/components/collaboration/InquiryForm";
import { InquiryList } from "@/components/collaboration/InquiryList";
import { RoleGate } from "@/components/auth/RoleGate";
import { useAppSelector } from "@/store/hooks";
import { useMarkNotificationsReadMutation } from "@/store/api/notificationsApi";

export default function CollaborationPage() {
  const user = useAppSelector((s) => s.auth.user);

  // Membuka halaman kolaborasi = melihat status inquiry → tandai sudah dibaca
  // (titik merah di navbar hilang). Hanya untuk client (pemilik inquiry).
  const [markRead] = useMarkNotificationsReadMutation();
  useEffect(() => {
    if (user?.role === "client" && user.id) markRead(user.id);
  }, [user?.role, user?.id, markRead]);

  // Form ditampilkan "setengah" dulu (di-clamp) supaya halaman muat satu layar;
  // klik → buka penuh lalu scroll otomatis ke form saat mau diisi.
  const [briefOpen, setBriefOpen] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  function openBrief() {
    setBriefOpen(true);
    requestAnimationFrame(() =>
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  }

  return (
    <>
      <NavBar />
      <main className="flex-grow">
        <RoleGate allow="client">
          {/* Hero */}
          <section className="w-full pt-4 md:pt-6 px-margin-mobile md:px-margin-desktop max-w-editorial mx-auto">
            <p className="text-label-uppercase text-secondary uppercase mb-4">
              CLIENT COLLABORATION
            </p>
            <h1 className="font-display text-headline-lg-mobile md:text-headline-lg text-primary uppercase leading-[0.95]">
              LET&apos;S COLLABORATE
            </h1>
            <p className="text-body-lg text-secondary max-w-prose mt-6">
              Submit your project brief to Portal Management and follow its
              progress here.
            </p>
          </section>

          <section className="px-margin-mobile md:px-margin-desktop pt-10 pb-12 max-w-editorial mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-gutter">
              {/* Pengajuan project brief — collapsible */}
              <div ref={formRef} className="scroll-mt-24">
                <div className="flex justify-between items-end mb-6 border-b border-outline-variant pb-4">
                  <h2 className="font-display text-headline-md text-primary uppercase">
                    NEW PROJECT BRIEF
                  </h2>
                </div>
                <div className="relative">
                  <div
                    className={
                      briefOpen
                        ? ""
                        : "max-h-[300px] overflow-hidden pointer-events-none select-none"
                    }
                  >
                    <InquiryForm clientName={user?.name} />
                  </div>
                  {!briefOpen && (
                    <button
                      type="button"
                      onClick={openBrief}
                      aria-label="Open the project brief form"
                      className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-background via-background/85 to-transparent"
                    >
                      <span className="mb-3 inline-flex items-center gap-2 border border-primary bg-background px-6 py-3 text-label-uppercase uppercase text-primary hover:bg-primary hover:text-on-primary transition-colors">
                        Start your brief
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          aria-hidden="true"
                        >
                          <path strokeLinecap="square" d="M6 9l6 6 6-6" />
                        </svg>
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {/* Pemantauan status inquiry */}
              <div>
                <div className="flex justify-between items-end mb-6 border-b border-outline-variant pb-4">
                  <h2 className="font-display text-headline-md text-primary uppercase">
                    YOUR INQUIRIES
                  </h2>
                </div>
                <InquiryList />
              </div>
            </div>
          </section>
        </RoleGate>
      </main>
      <Footer />
    </>
  );
}
