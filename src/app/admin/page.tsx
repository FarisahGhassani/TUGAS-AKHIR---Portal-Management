"use client";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { adminFooterItems, adminSections } from "@/components/admin/adminNav";
import { RoleGate } from "@/components/auth/RoleGate";
import { MailIcon, PendingIcon } from "@/components/dashboard/icons";
import { useAppSelector } from "@/store/hooks";
import {
  useGetAdminOverviewQuery,
  type AdminNotification,
} from "@/store/api/adminApi";

export default function AdminOverviewPage() {
  // Akses admin-only. Role = sumber kebenaran dari auth state (RTK). Query admin
  // di-skip kalau bukan admin supaya data sensitif tidak ditarik tanpa hak.
  const isAdmin = useAppSelector((s) => s.auth.user?.role === "admin");
  const adminName = useAppSelector((s) => s.auth.user?.name);
  const { data, isLoading, isError } = useGetAdminOverviewQuery(undefined, {
    skip: !isAdmin,
  });

  return (
    <RoleGate allow="admin">
    <DashboardShell
      sections={adminSections}
      footerItems={adminFooterItems}
      brandHref="/admin"
    >
      {isLoading || !data ? (
        <p className="text-label-uppercase text-on-surface-variant uppercase">
          Memuat ringkasan admin…
        </p>
      ) : isError ? (
        <p className="text-label-uppercase text-error uppercase">
          Gagal memuat ringkasan admin.
        </p>
      ) : (
        <div className="flex flex-col gap-8">
          {/* Hero editorial ringkas — sapa admin tanpa gap berlebih. */}
          <header>
            <p className="text-label-uppercase text-secondary uppercase mb-2">
              ADMIN · CONTROL ROOM
            </p>
            <h1
              className="font-display text-primary uppercase leading-[0.9] tracking-[-0.03em] font-bold"
              style={{ fontSize: "clamp(32px, 5vw, 56px)" }}
            >
              {adminName ?? "OVERVIEW"}
            </h1>
            <p className="text-body-md text-secondary max-w-prose mt-3">
              Semua yang perlu Anda tinjau: pendaftaran yang menunggu, inquiry
              klien terbaru, dan aktivitas terkini di seluruh agency.
            </p>
          </header>

          {/* Hanya angka yang penting & butuh aksi. */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-gutter">
            <MetricCard
              label="Pendaftaran Menunggu"
              value={data.metrics.pendingApplications}
              accent
            />
            <MetricCard
              label="Inquiry Baru"
              value={data.metrics.newInquiries}
              accent
            />
            <MetricCard
              label="Talent Aktif"
              value={data.metrics.activeTalent}
            />
          </section>

          {/* Notifikasi terbaru — ringkas, menggantikan tabel yang ruwet. */}
          <section className="flex flex-col gap-4">
            <div className="flex justify-between items-end border-b border-outline-variant pb-4">
              <h2 className="font-display text-headline-md text-primary uppercase">
                LATEST NOTIFICATIONS
              </h2>
            </div>
            {data.notifications.length === 0 ? (
              <p className="text-label-uppercase text-on-surface-variant uppercase">
                Belum ada yang baru saat ini.
              </p>
            ) : (
              <ul className="flex flex-col">
                {data.notifications.map((n) => (
                  <NotificationRow key={n.id} notification={n} />
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </DashboardShell>
    </RoleGate>
  );
}

function MetricCard({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div
      className={`p-6 border flex flex-col gap-3 ${
        accent
          ? "bg-primary border-primary text-on-primary"
          : "bg-surface border-outline-variant"
      }`}
    >
      <span
        className={`text-label-uppercase uppercase ${
          accent ? "text-on-primary/70" : "text-secondary"
        }`}
      >
        {label}
      </span>
      <span
        className={`font-display leading-none ${
          accent ? "text-on-primary" : "text-primary"
        }`}
        style={{ fontSize: "clamp(36px, 4.5vw, 52px)" }}
      >
        {value}
      </span>
    </div>
  );
}

function NotificationRow({ notification }: { notification: AdminNotification }) {
  const isApplication = notification.kind === "application";
  return (
    <li className="flex items-start gap-4 py-5 border-b border-outline-variant">
      <span
        aria-hidden="true"
        className="shrink-0 mt-0.5 w-10 h-10 border border-outline-variant flex items-center justify-center text-primary"
      >
        {isApplication ? <PendingIcon /> : <MailIcon />}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-4">
          <p className="text-body-md text-primary font-medium">
            {notification.title}
          </p>
          <span className="shrink-0 text-caption text-on-surface-variant uppercase tracking-[0.1em]">
            {notification.time}
          </span>
        </div>
        <p className="text-body-md text-secondary mt-1 line-clamp-1">
          {notification.detail}
        </p>
      </div>
    </li>
  );
}
