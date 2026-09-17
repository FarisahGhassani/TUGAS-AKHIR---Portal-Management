"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Modal } from "@/components/Modal";
import { BatchForm } from "@/components/admin/BatchForm";
import { adminFooterItems, adminSections } from "@/components/admin/adminNav";
import { RoleGate } from "@/components/auth/RoleGate";
import { useAppSelector } from "@/store/hooks";
import {
  useGetBatchesQuery,
  type ModellingBatch,
} from "@/store/api/dashboardApi";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});
function formatDate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : dateFormatter.format(d).toUpperCase();
}

export default function AdminClassesPage() {
  const isAdmin = useAppSelector((s) => s.auth.user?.role === "admin");
  const {
    data: batches,
    isLoading,
    isError,
    isFetching,
  } = useGetBatchesQuery(undefined, { skip: !isAdmin });

  const [modal, setModal] = useState<{ batch: ModellingBatch | null } | null>(
    null,
  );

  const list = useMemo(() => batches ?? [], [batches]);

  return (
    <RoleGate allow="admin">
      <DashboardShell
        sections={adminSections}
        footerItems={adminFooterItems}
        brandHref="/admin"
      >
        {isLoading ? (
          <p className="text-label-uppercase text-on-surface-variant uppercase">
            Memuat data kelas…
          </p>
        ) : isError ? (
          <p className="text-label-uppercase text-error uppercase">
            Gagal memuat data kelas.
          </p>
        ) : (
          <div className="flex flex-col gap-6 max-w-5xl">
            <header className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-label-uppercase text-secondary uppercase mb-1">
                  MANAGEMENT · CLASSES
                </p>
                <h1
                  className="font-display text-primary uppercase leading-[0.9] tracking-[-0.03em] font-bold"
                  style={{ fontSize: "clamp(28px, 4vw, 44px)" }}
                >
                  CLASS BATCHES
                </h1>
                <p className="text-body-md text-secondary max-w-prose mt-2">
                  Buat batch (urut) dan buka detail kelas untuk memproses
                  pendaftaran, melihat daftar murid yang join, serta mengunggah
                  sertifikat kelulusan.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModal({ batch: null })}
                className="px-5 py-3 bg-primary text-on-primary text-label-uppercase hover:bg-accent transition-colors uppercase"
              >
                + Tambah Batch
              </button>
            </header>

            {isFetching && (
              <p className="text-caption text-secondary uppercase tracking-[0.1em]">
                Memuat ulang…
              </p>
            )}

            {list.length === 0 ? (
              <p className="text-label-uppercase text-on-surface-variant uppercase">
                Belum ada batch. Tambahkan satu untuk membuka kelas.
              </p>
            ) : (
              <div className="flex flex-col gap-5">
                {list.map((batch) => (
                  <BatchCard
                    key={batch.id}
                    batch={batch}
                    onEdit={() => setModal({ batch })}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        <Modal
          open={modal !== null}
          onClose={() => setModal(null)}
          title={modal?.batch ? "EDIT BATCH" : "TAMBAH BATCH"}
        >
          {modal !== null && (
            <BatchForm
              key={modal.batch?.id ?? "new"}
              batch={modal.batch}
              onDone={() => setModal(null)}
            />
          )}
        </Modal>
      </DashboardShell>
    </RoleGate>
  );
}

// Ringkasan satu batch: kuota terpakai (murid di talent_batch), jumlah lulus,
// dan antrean pendaftaran. Detail lengkapnya di halaman /admin/classes/[id].
function BatchCard({
  batch,
  onEdit,
}: {
  batch: ModellingBatch;
  onEdit: () => void;
}) {
  const sisaKuota = Math.max(0, batch.kuota - batch.muridCount);

  return (
    <section className="border border-outline-variant bg-surface">
      <div className="flex flex-wrap items-start justify-between gap-4 p-5 border-b border-outline-variant">
        <div className="flex items-start gap-4">
          <span
            className="font-display text-primary leading-none tabular-nums shrink-0"
            style={{ fontSize: "clamp(28px, 3vw, 38px)" }}
          >
            {String(batch.batchKe).padStart(2, "0")}
          </span>
          <div>
            <h2 className="font-display text-headline-md text-primary uppercase leading-tight">
              {batch.namaBatch}
            </h2>
            <p className="text-caption text-secondary uppercase tracking-[0.08em] mt-1">
              {formatDate(batch.tglMulai)} – {formatDate(batch.tglBerakhir)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <RegistrationBadge status={batch.statusPendaftaran} />
          <button
            type="button"
            onClick={onEdit}
            className="text-label-uppercase text-primary hover:text-accent transition-colors uppercase"
          >
            Edit
          </button>
        </div>
      </div>

      <div className="p-5 flex flex-wrap items-end justify-between gap-6">
        <dl className="flex flex-wrap gap-x-10 gap-y-4">
          <Stat
            label="Murid Join"
            value={`${batch.muridCount}/${batch.kuota}`}
            note={`${sisaKuota} kursi tersisa`}
          />
          <Stat label="Lulus" value={String(batch.lulusCount)} />
          <Stat
            label="Menunggu Keputusan"
            value={String(batch.pendingCount)}
            note={batch.pendingCount > 0 ? "Perlu diproses" : undefined}
          />
        </dl>
        <Link
          href={`/admin/classes/${batch.id}`}
          className="px-5 py-3 border border-primary text-primary text-label-uppercase hover:bg-primary hover:text-on-primary transition-colors uppercase"
        >
          Lihat Murid & Pendaftaran →
        </Link>
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div>
      <dt className="text-label-uppercase text-secondary uppercase mb-1">
        {label}
      </dt>
      <dd className="font-display text-headline-md text-primary tabular-nums leading-none">
        {value}
      </dd>
      {note && (
        <p className="text-caption text-on-surface-variant uppercase tracking-[0.1em] mt-1">
          {note}
        </p>
      )}
    </div>
  );
}

function RegistrationBadge({ status }: { status: "buka" | "tutup" }) {
  const open = status === "buka";
  return (
    <span
      className={`inline-flex items-center gap-2 border px-3 py-1 text-label-uppercase uppercase ${
        open
          ? "border-primary text-primary"
          : "border-outline-variant text-secondary"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 ${open ? "bg-primary" : "bg-secondary"}`}
        aria-hidden="true"
      />
      {open ? "BUKA" : "TUTUP"}
    </span>
  );
}
