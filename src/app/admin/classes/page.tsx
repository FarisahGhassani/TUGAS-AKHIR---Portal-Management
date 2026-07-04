"use client";

import { useMemo, useState } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Modal } from "@/components/Modal";
import { adminFooterItems, adminSections } from "@/components/admin/adminNav";
import { RoleGate } from "@/components/auth/RoleGate";
import { useAppSelector } from "@/store/hooks";
import { FileField, type PickedFile } from "@/components/dashboard/FileField";
import {
  useGetBatchesQuery,
  useCreateBatchMutation,
  useUpdateBatchMutation,
  useGetClassRegistrationsQuery,
  useUpdateClassRegistrationMutation,
  type ModellingBatch,
  type ClassRegistration,
  type ClassRegistrationStatus,
  type GraduationStatus,
} from "@/store/api/dashboardApi";

const gradeOptions: { value: GraduationStatus; label: string }[] = [
  { value: "belum", label: "BELUM LULUS" },
  { value: "lulus", label: "LULUS" },
  { value: "tidak_lulus", label: "TIDAK LULUS" },
];

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

const inputClass =
  "w-full border-0 border-b border-outline bg-transparent px-0 py-2 focus:outline-none focus:border-primary text-body-md text-primary placeholder:text-outline-variant transition-colors";
const labelClass = "text-label-uppercase text-secondary block uppercase mb-2";
const selectClass = `${inputClass} appearance-none rounded-none cursor-pointer pr-8`;

const regStatusMeta: Record<
  ClassRegistrationStatus,
  { label: string; className: string }
> = {
  submitted: { label: "SUBMITTED", className: "border-accent text-accent" },
  in_progress: {
    label: "IN PROGRESS",
    className: "border-primary text-primary",
  },
  accepted: { label: "ACCEPTED", className: "border-primary text-primary" },
  rejected: { label: "REJECTED", className: "border-error text-error" },
};

export default function AdminClassesPage() {
  const isAdmin = useAppSelector((s) => s.auth.user?.role === "admin");
  const {
    data: batches,
    isLoading,
    isError,
    isFetching,
  } = useGetBatchesQuery(undefined, { skip: !isAdmin });
  const { data: regs } = useGetClassRegistrationsQuery(undefined, {
    skip: !isAdmin,
  });

  const [modal, setModal] = useState<{ batch: ModellingBatch | null } | null>(
    null,
  );

  const list = useMemo(() => batches ?? [], [batches]);
  const registrations = useMemo(() => regs ?? [], [regs]);

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
                  OPERATIONS · CLASSES
                </p>
                <h1
                  className="font-display text-primary uppercase leading-[0.9] tracking-[-0.03em] font-bold"
                  style={{ fontSize: "clamp(28px, 4vw, 44px)" }}
                >
                  CLASS BATCHES
                </h1>
                <p className="text-body-md text-secondary max-w-prose mt-2">
                  Buat batch (urut), proses pendaftaran kelas yang masuk, dan
                  lihat murid yang diterima per batch.
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
                    registrations={registrations.filter(
                      (r) => r.batchId === batch.id,
                    )}
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

function BatchCard({
  batch,
  registrations,
  onEdit,
}: {
  batch: ModellingBatch;
  registrations: ClassRegistration[];
  onEdit: () => void;
}) {
  const pending = registrations.filter(
    (r) => r.status === "submitted" || r.status === "in_progress",
  );
  const students = registrations.filter((r) => r.status === "accepted");

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
              {formatDate(batch.tglMulai)} – {formatDate(batch.tglBerakhir)} ·
              KUOTA {batch.kuota}
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

      <div className="p-5 flex flex-col gap-6">
        {/* Pendaftaran masuk → approve/reject */}
        <div>
          <p className="text-label-uppercase text-secondary uppercase mb-3">
            Pendaftaran Masuk ({pending.length})
          </p>
          {pending.length === 0 ? (
            <p className="text-caption text-on-surface-variant uppercase tracking-[0.1em]">
              Tidak ada pendaftaran yang menunggu.
            </p>
          ) : (
            <ul className="flex flex-col">
              {pending.map((r) => (
                <RegistrationRow key={r.id} reg={r} />
              ))}
            </ul>
          )}
        </div>

        {/* Murid diterima */}
        <div className="border-t border-outline-variant pt-4">
          <p className="text-label-uppercase text-secondary uppercase mb-3">
            Murid Diterima ({students.length})
          </p>
          {students.length === 0 ? (
            <p className="text-caption text-on-surface-variant uppercase tracking-[0.1em]">
              Belum ada murid diterima di batch ini.
            </p>
          ) : (
            <ul className="flex flex-col">
              {students.map((s, i) => (
                <StudentRow key={s.id} student={s} index={i + 1} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

function RegistrationRow({ reg }: { reg: ClassRegistration }) {
  const [update, { isLoading }] = useUpdateClassRegistrationMutation();
  const [open, setOpen] = useState(false);

  async function act(status: ClassRegistrationStatus) {
    if (status === "rejected" && !window.confirm(`Tolak pendaftaran ${reg.name}?`))
      return;
    await update({ id: reg.id, status });
    setOpen(false);
  }

  return (
    <li className="flex flex-wrap items-center gap-3 py-3 border-b border-outline-variant">
      <span className="flex-1 min-w-[8rem]">
        <span className="text-body-md text-primary font-medium">{reg.name}</span>
        <span className="block text-caption text-on-surface-variant">
          {reg.noTelepon} · {reg.appliedAt}
        </span>
      </span>
      <span
        className={`inline-flex items-center gap-2 border px-3 py-1 text-label-uppercase uppercase ${regStatusMeta[reg.status].className}`}
      >
        <span className="w-1.5 h-1.5 bg-current" aria-hidden="true" />
        {regStatusMeta[reg.status].label}
      </span>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-label-uppercase text-primary hover:text-accent transition-colors uppercase whitespace-nowrap"
      >
        Detail
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="DETAIL PENDAFTARAN KELAS"
      >
        <div className="flex flex-col gap-5">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 border-b border-outline-variant pb-5">
            <DetailItem label="Nama" value={reg.name} />
            <DetailItem label="Telepon" value={reg.noTelepon} />
            <DetailItem label="Batch" value={reg.batchLabel} />
            <DetailItem label="Tanggal Mendaftar" value={reg.appliedAt} />
            <DetailItem label="Status" value={regStatusMeta[reg.status].label} />
          </dl>
          <p className="text-caption text-secondary tracking-[0.06em]">
            Bukti pembayaran ditangani offline di luar aplikasi. Tinjau lalu
            terima atau tolak pendaftaran ini.
          </p>
          <div className="flex justify-end gap-3">
            {reg.status === "submitted" && (
              <button
                type="button"
                disabled={isLoading}
                onClick={() => act("in_progress")}
                className="px-5 py-2.5 border border-outline text-secondary text-label-uppercase hover:text-accent hover:border-accent transition-colors uppercase disabled:opacity-50"
              >
                Proses
              </button>
            )}
            <button
              type="button"
              disabled={isLoading}
              onClick={() => act("rejected")}
              className="px-5 py-2.5 border border-outline text-secondary text-label-uppercase hover:text-error hover:border-error transition-colors uppercase disabled:opacity-50"
            >
              Tolak
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => act("accepted")}
              className="px-6 py-2.5 bg-primary text-on-primary text-label-uppercase hover:bg-accent transition-colors uppercase disabled:opacity-50"
            >
              Terima
            </button>
          </div>
        </div>
      </Modal>
    </li>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-label-uppercase text-secondary uppercase mb-1">
        {label}
      </dt>
      <dd className="text-body-md text-primary">{value}</dd>
    </div>
  );
}

// Murid diterima: set kelulusan + (jika LULUS) upload PDF sertifikat.
function StudentRow({
  student,
  index,
}: {
  student: ClassRegistration;
  index: number;
}) {
  const [update, { isLoading }] = useUpdateClassRegistrationMutation();

  async function setGrade(statusLulus: GraduationStatus) {
    await update({ id: student.id, statusLulus });
  }
  async function uploadCert(file: PickedFile | null) {
    if (!file?.dataUrl) return;
    await update({ id: student.id, sertifikatUrl: file.dataUrl });
  }

  return (
    <li className="py-3 border-b border-outline-variant">
      <div className="flex flex-wrap items-center gap-3">
        <span className="w-6 text-secondary tabular-nums">{index}</span>
        <span className="flex-1 min-w-[8rem] text-body-md text-primary font-medium">
          {student.name}
        </span>
        <span className="text-caption text-on-surface-variant">
          {student.noTelepon}
        </span>
        <select
          aria-label="Status kelulusan"
          value={student.statusLulus}
          disabled={isLoading}
          onChange={(e) => setGrade(e.target.value as GraduationStatus)}
          className="border border-outline bg-transparent px-2 py-1.5 text-label-uppercase uppercase text-primary appearance-none cursor-pointer focus:outline-none focus:border-primary disabled:opacity-50"
        >
          {gradeOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Sertifikat hanya untuk yang LULUS */}
      {student.statusLulus === "lulus" && (
        <div className="mt-3 ml-9 flex flex-wrap items-end gap-4 border-l border-outline-variant pl-4">
          {student.sertifikatUrl ? (
            <a
              href={student.sertifikatUrl}
              download={`sertifikat-${student.name}.pdf`}
              className="text-label-uppercase text-primary hover:text-accent transition-colors uppercase"
            >
              ✓ Lihat sertifikat
            </a>
          ) : (
            <span className="text-caption text-on-surface-variant uppercase tracking-[0.1em]">
              Belum ada sertifikat
            </span>
          )}
          <div className="max-w-xs">
            <FileField
              label={
                student.sertifikatUrl
                  ? "Ganti sertifikat (PDF)"
                  : "Upload sertifikat (PDF)"
              }
              accept="application/pdf"
              value={null}
              onChange={uploadCert}
            />
          </div>
        </div>
      )}
    </li>
  );
}

function BatchForm({
  batch,
  onDone,
}: {
  batch: ModellingBatch | null;
  onDone: () => void;
}) {
  const [createBatch, { isLoading: creating }] = useCreateBatchMutation();
  const [updateBatch, { isLoading: updating }] = useUpdateBatchMutation();
  const isLoading = creating || updating;

  const [namaBatch, setNamaBatch] = useState(batch?.namaBatch ?? "");
  const [kuota, setKuota] = useState(batch ? String(batch.kuota) : "");
  const [tglMulai, setTglMulai] = useState(batch?.tglMulai ?? "");
  const [tglBerakhir, setTglBerakhir] = useState(batch?.tglBerakhir ?? "");
  const [statusPendaftaran, setStatusPendaftaran] = useState<"buka" | "tutup">(
    batch?.statusPendaftaran ?? "buka",
  );
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!namaBatch.trim()) return setError("Nama batch wajib diisi.");
    if (!kuota || Number(kuota) <= 0) return setError("Kuota tidak valid.");
    if (!tglMulai || !tglBerakhir)
      return setError("Tanggal mulai & berakhir wajib diisi.");

    const payload = {
      namaBatch: namaBatch.trim(),
      kuota: Number(kuota),
      tglMulai,
      tglBerakhir,
      statusPendaftaran,
    };

    try {
      if (batch) {
        await updateBatch({ id: batch.id, ...payload }).unwrap();
      } else {
        await createBatch(payload).unwrap();
      }
      onDone();
    } catch (err) {
      setError(
        err && typeof err === "object" && "data" in err
          ? ((err as { data?: { message?: string } }).data?.message ??
            "Gagal menyimpan batch.")
          : "Gagal menyimpan batch.",
      );
    }
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
      <div>
        <label htmlFor="b-nama" className={labelClass}>
          Nama Batch
        </label>
        <input
          id="b-nama"
          type="text"
          value={namaBatch}
          onChange={(e) => setNamaBatch(e.target.value)}
          placeholder="mis. Runway Fundamentals"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="b-kuota" className={labelClass}>
          Kuota
        </label>
        <input
          id="b-kuota"
          type="number"
          min={1}
          value={kuota}
          onChange={(e) => setKuota(e.target.value)}
          className={inputClass}
        />
        <p className="text-caption text-secondary tracking-[0.06em] mt-1">
          Nomor batch (Batch 01, 02, …) otomatis dari urutan.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="b-mulai" className={labelClass}>
            Tanggal Mulai
          </label>
          <input
            id="b-mulai"
            type="date"
            value={tglMulai}
            onChange={(e) => setTglMulai(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="b-berakhir" className={labelClass}>
            Tanggal Berakhir
          </label>
          <input
            id="b-berakhir"
            type="date"
            value={tglBerakhir}
            onChange={(e) => setTglBerakhir(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="b-status" className={labelClass}>
          Status Pendaftaran
        </label>
        <select
          id="b-status"
          value={statusPendaftaran}
          onChange={(e) =>
            setStatusPendaftaran(e.target.value as "buka" | "tutup")
          }
          className={selectClass}
        >
          <option value="buka">BUKA (bisa didaftari)</option>
          <option value="tutup">TUTUP (disembunyikan)</option>
        </select>
      </div>

      {error && (
        <p className="text-caption text-error uppercase tracking-[0.1em]">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-4 mt-1">
        <button
          type="button"
          onClick={onDone}
          className="px-6 py-3 border border-outline text-secondary text-label-uppercase hover:text-accent hover:border-accent transition-colors uppercase"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 bg-primary text-on-primary text-label-uppercase hover:bg-accent transition-colors uppercase disabled:opacity-50"
        >
          {isLoading ? "MENYIMPAN…" : batch ? "Simpan Perubahan" : "Tambah Batch"}
        </button>
      </div>
    </form>
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
