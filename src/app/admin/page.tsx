"use client";

import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { adminFooterItems, adminSections } from "@/components/admin/adminNav";
import { RoleGate } from "@/components/auth/RoleGate";
import { MailIcon, PendingIcon } from "@/components/dashboard/icons";
import { useAppSelector } from "@/store/hooks";
import {
  useGetAdminOverviewQuery,
  useGetAdminNotificationsQuery,
  useMarkAdminNotificationsReadMutation,
  type AdminNotificationItem,
} from "@/store/api/adminApi";

export default function AdminOverviewPage() {
  // Akses admin-only. Role = sumber kebenaran dari auth state (RTK). Query admin
  // di-skip kalau bukan admin supaya data sensitif tidak ditarik tanpa hak.
  const isAdmin = useAppSelector((s) => s.auth.user?.role === "admin");
  const adminName = useAppSelector((s) => s.auth.user?.name);
  const adminId = useAppSelector((s) => s.auth.user?.id);
  const { data, isLoading, isError } = useGetAdminOverviewQuery(undefined, {
    skip: !isAdmin,
  });
  // Notifikasi ditarik dari DB (pendaftaran + inquiry terbaru), bukan dari mock.
  // userId (admin) dikirim supaya server menandai mana yang belum dibaca.
  const { data: notifications } = useGetAdminNotificationsQuery(adminId ?? "", {
    skip: !isAdmin || !adminId,
  });
  const [markRead] = useMarkAdminNotificationsReadMutation();
  const unreadCount = (notifications ?? []).filter((n) => n.unread).length;
  // Klik salah satu notifikasi = sudah dilihat → tandai semua dibaca (titik
  // merah hilang) lalu navigasi ke submenu terkait (via Link di dalam row).
  const onNotifRead = () => {
    if (adminId && unreadCount > 0) markRead(adminId);
  };

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
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
            <MetricCard
              label="Pendaftaran Menunggu"
              value={data.pendingApplications}
              accent
            />
            <MetricCard
              label="Inquiry Baru"
              value={data.newInquiries}
              accent
            />
            <MetricCard
              label="Talent Aktif"
              value={data.activeTalent}
            />
            <MetricCard
              label="Kelas Dibuka"
              value={data.activeClassBatches}
            />
          </section>

          {/* Notifikasi terbaru — ringkas, menggantikan tabel yang ruwet. */}
          <section className="flex flex-col gap-4">
            <div className="flex justify-between items-end border-b border-outline-variant pb-4">
              <h2 className="font-display text-headline-md text-primary uppercase">
                LATEST NOTIFICATIONS
              </h2>
              {unreadCount > 0 && (
                <span className="inline-flex items-center gap-2 text-label-uppercase text-error uppercase">
                  <span
                    className="inline-block h-2 w-2 bg-error"
                    aria-hidden="true"
                  />
                  {unreadCount} baru
                </span>
              )}
            </div>
            {(notifications ?? []).length === 0 ? (
              <p className="text-label-uppercase text-on-surface-variant uppercase">
                Belum ada yang baru saat ini.
              </p>
            ) : (
              <ul className="flex flex-col">
                {(notifications ?? []).map((n) => (
                  <NotificationRow
                    key={n.id}
                    notification={n}
                    onRead={onNotifRead}
                  />
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

function NotificationRow({
  notification,
  onRead,
}: {
  notification: AdminNotificationItem;
  onRead: () => void;
}) {
  const isApplication = notification.kind === "application";
  return (
    <li className="border-b border-outline-variant">
      {/* Klik → tandai dibaca + submenu terkait (inquiry→clients, talent→talent,
          kelas→classes). */}
      <Link
        href={notification.href}
        onClick={onRead}
        className="group flex items-center gap-4 py-5 hover:bg-surface-container-low transition-colors"
      >
        <span
          aria-hidden="true"
          className="shrink-0 w-10 h-10 border border-outline-variant flex items-center justify-center text-primary"
        >
          {isApplication ? <PendingIcon /> : <MailIcon />}
        </span>
        {/* Titik merah = notifikasi belum dibaca. */}
        {notification.unread && (
          <span
            className="shrink-0 h-2 w-2 bg-error"
            aria-label="belum dibaca"
          />
        )}
        <p className="min-w-0 flex-1 text-body-md text-primary font-medium truncate group-hover:text-accent transition-colors">
          {notification.title}
        </p>
        <span className="shrink-0 text-caption text-on-surface-variant uppercase tracking-[0.1em]">
          {notification.time}
        </span>
        <span
          aria-hidden="true"
          className="shrink-0 text-secondary group-hover:text-accent transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path strokeLinecap="square" d="M9 6l6 6-6 6" />
          </svg>
        </span>
      </Link>
    </li>
  );
}
