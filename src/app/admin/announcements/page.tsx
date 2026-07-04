"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Pagination } from "@/components/Pagination";
import { AnnouncementForm } from "@/components/admin/AnnouncementForm";
import { adminFooterItems, adminSections } from "@/components/admin/adminNav";
import { RoleGate } from "@/components/auth/RoleGate";
import { useAppSelector } from "@/store/hooks";
import {
  useGetAllAnnouncementsQuery,
  useDeleteAnnouncementMutation,
  isAnnouncementExpired,
  type Announcement,
  type AnnouncementStatus,
} from "@/store/api/announcementsApi";

const PAGE_SIZE = 10;

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});
function formatDate(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : dateFormatter.format(d).toUpperCase();
}

export default function AdminAnnouncementsPage() {
  const isAdmin = useAppSelector((s) => s.auth.user?.role === "admin");
  const { data, isLoading, isError } = useGetAllAnnouncementsQuery(undefined, {
    skip: !isAdmin,
  });
  const [deleteAnnouncement] = useDeleteAnnouncementMutation();

  const [editing, setEditing] = useState<Announcement | null>(null);
  const [page, setPage] = useState(1);

  const list = data ?? [];
  const pageCount = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageItems = list.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  async function handleDelete(a: Announcement) {
    if (!window.confirm(`Hapus "${a.judul}"? Tindakan ini tidak bisa dibatalkan.`))
      return;
    await deleteAnnouncement(a.id);
    if (editing?.id === a.id) setEditing(null);
  }

  function startEdit(a: Announcement) {
    setEditing(a);
    if (typeof window !== "undefined")
      window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <RoleGate allow="admin">
      <DashboardShell
        sections={adminSections}
        footerItems={adminFooterItems}
        brandHref="/admin"
      >
        <div className="flex flex-col gap-8">
          <header>
            <p className="text-label-uppercase text-secondary uppercase mb-2">
              AGENCY · BROADCAST
            </p>
            <h1
              className="font-display text-primary uppercase leading-[0.9] tracking-[-0.03em] font-bold"
              style={{ fontSize: "clamp(32px, 5vw, 56px)" }}
            >
              ANNOUNCEMENTS
            </h1>
            <p className="text-body-md text-secondary max-w-prose mt-3">
              Apa pun yang Anda terbitkan di sini akan tampil di tab
              Announcements pada landing page. Set status Aktif untuk
              menampilkannya; Nonaktif atau tenggat yang sudah lewat akan
              menyembunyikannya.
            </p>
          </header>

          <AnnouncementForm
            key={editing?.id ?? "new"}
            editing={editing}
            onDone={() => setEditing(null)}
          />

          <section className="flex flex-col gap-4">
            <div className="flex justify-between items-end border-b border-outline-variant pb-4">
              <h2 className="font-display text-headline-md text-primary uppercase">
                ALL ANNOUNCEMENTS
              </h2>
            </div>

            {isLoading ? (
              <p className="text-label-uppercase text-on-surface-variant uppercase">
                Memuat pengumuman…
              </p>
            ) : isError ? (
              <p className="text-label-uppercase text-error uppercase">
                Gagal memuat pengumuman.
              </p>
            ) : list.length === 0 ? (
              <p className="text-label-uppercase text-on-surface-variant uppercase">
                Belum ada pengumuman. Buat satu di atas.
              </p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[760px]">
                    <thead>
                      <tr className="border-b border-outline-variant">
                        <th className="py-4 pr-4 text-label-uppercase text-secondary font-normal uppercase w-12">
                          No
                        </th>
                        <th className="py-4 text-label-uppercase text-secondary font-normal uppercase">
                          Pengumuman
                        </th>
                        <th className="py-4 text-label-uppercase text-secondary font-normal uppercase">
                          Tenggat
                        </th>
                        <th className="py-4 text-label-uppercase text-secondary font-normal uppercase">
                          Status
                        </th>
                        <th className="py-4 text-right text-label-uppercase text-secondary font-normal uppercase">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-body-md">
                      {pageItems.map((a, i) => (
                        <tr
                          key={a.id}
                          className="border-b border-outline-variant align-top hover:bg-surface-container-low transition-colors"
                        >
                          <td className="py-4 pr-4 text-secondary tabular-nums">
                            {(safePage - 1) * PAGE_SIZE + i + 1}
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={a.fotoPoster}
                                alt={a.judul}
                                className="h-12 w-12 object-cover border border-outline-variant shrink-0"
                              />
                              <span className="text-primary font-medium">
                                {a.judul}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 text-secondary">
                            {formatDate(a.tanggalBerakhir)}
                          </td>
                          <td className="py-4">
                            <StatusBadge
                              status={a.status}
                              expired={isAnnouncementExpired(a.tanggalBerakhir)}
                            />
                          </td>
                          <td className="py-4 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => startEdit(a)}
                              className="text-label-uppercase text-primary hover:text-accent transition-colors uppercase"
                            >
                              Edit
                            </button>
                            <span className="text-outline-variant px-2">/</span>
                            <button
                              type="button"
                              onClick={() => handleDelete(a)}
                              className="text-label-uppercase text-secondary hover:text-error transition-colors uppercase"
                            >
                              Hapus
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <Pagination
                  page={safePage}
                  pageSize={PAGE_SIZE}
                  total={list.length}
                  onPageChange={setPage}
                />
              </>
            )}
          </section>
        </div>
      </DashboardShell>
    </RoleGate>
  );
}

function StatusBadge({
  status,
  expired,
}: {
  status: AnnouncementStatus;
  expired: boolean;
}) {
  const live = status === "aktif" && !expired;
  const label = expired
    ? "KEDALUWARSA"
    : status === "aktif"
      ? "AKTIF"
      : "NONAKTIF";
  return (
    <span
      className={`inline-flex items-center gap-2 border px-3 py-1 text-label-uppercase uppercase ${
        live
          ? "border-primary text-primary"
          : "border-outline-variant text-secondary"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 ${live ? "bg-primary" : "bg-secondary"}`}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}
