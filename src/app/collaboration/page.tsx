"use client";

import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { InquiryForm } from "@/components/collaboration/InquiryForm";
import { InquiryList } from "@/components/collaboration/InquiryList";
import { RoleGate } from "@/components/auth/RoleGate";
import { useAppSelector } from "@/store/hooks";

export default function CollaborationPage() {
  const user = useAppSelector((s) => s.auth.user);

  return (
    <>
      <NavBar />
      <main className="flex-grow">
        <RoleGate allow="client">
          {/* Hero */}
          <section className="w-full pt-8 md:pt-10 px-margin-mobile md:px-margin-desktop max-w-editorial mx-auto">
            <p className="text-label-uppercase text-secondary uppercase mb-4">
              CLIENT COLLABORATION
            </p>
            <h1 className="font-display text-headline-lg-mobile md:text-headline-lg text-primary uppercase leading-[0.95]">
              LET&apos;S COLLABORATE
            </h1>
            <p className="text-body-lg text-secondary max-w-prose mt-6">
              Submit your project brief to Portal Management and track its
              status from <span className="text-primary">Submitted</span> →{" "}
              <span className="text-primary">In Progress</span> →{" "}
              <span className="text-accent">Completed</span>.
            </p>
          </section>

          <section className="px-margin-mobile md:px-margin-desktop pt-10 pb-12 max-w-editorial mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-gutter">
              {/* Pengajuan project brief */}
              <div>
                <div className="flex justify-between items-end mb-6 border-b border-outline-variant pb-4">
                  <h2 className="font-display text-headline-md text-primary uppercase">
                    NEW PROJECT BRIEF
                  </h2>
                </div>
                <InquiryForm clientName={user?.name} />
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
