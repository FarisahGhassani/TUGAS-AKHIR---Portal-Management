"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Modal } from "@/components/Modal";
import { Pagination } from "@/components/Pagination";
import { BatchForm } from "@/components/admin/BatchForm";
import { adminFooterItems, adminSections } from "@/components/admin/adminNav";
import { RoleGate } from "@/components/auth/RoleGate";
import { FileField, type PickedFile } from "@/components/dashboard/FileField";
import { useAppSelector } from "@/store/hooks";
import {
  useGetBatchDetailQuery,
  useUpdateClassRegistrationMutation,
  type BatchStudent,
  type ClassRegistration,
  type ClassRegistrationStatus,
  type GraduationStatus,
  type ModellingBatch,
} from "@/store/api/dashboardApi";

// 10 baris per halaman — sama seperti tabel admin lainnya.
const PAGE_SIZE = 10;

const gradeOptions: { value: GraduationStatus; label: string }[] = [
  { value: "belum", label: "BELUM LULUS" },
  { value: "lulus", label: "LULUS" },
  { value: "tidak_lulus", label: "TIDAK LULUS" },
];

const gradeStyle: Record<GraduationStatus, string> = {
  belum: "border-outline-variant text-secondary",
  lulus: "border-primary text-primary",
  tidak_lulus: "border-error text-error",
};

const regStatusMeta: Record<
  ClassRegistrationStatus,
  { label: string; className: string }
> = {
  submitted: { label: "SUBMITTED", className: "border-accent text-accent" },
  in_progress: { label: "IN PROGRESS", className: "border-primary text-primary" },
  accepted: { label: "ACCEPTED", className: "border-primary text-primary" },
  rejected: { label: "REJECTED", className: "border-error text-error" },
  // Terpasang otomatis oleh server saat kelulusan ditetapkan.
  completed: { label: "COMPLETED", className: "border-outline-variant text-secondary" },
};

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

const thClass =
  "py-4 text-label-uppercase text-secondary font-normal uppercase";

/**
 * Detail satu kelas: header batch, antrean pendaftaran yang perlu diputuskan,
 * dan TABEL MURID (baris talent_batch) — siapa saja yang join batch ini, status
 * kelulusannya, dan sertifikatnya. Semua data lewat RTK Query; keputusan admin
 * memakai mutation yang sama (PATCH class-registrations) sehingga tabel langsung
 * ter-refresh oleh invalidasi tag.
 */
export default function AdminClassDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const isAdmin = useAppSelector((s) => s.auth.user?.role === "admin");
  const { data, isLoading, isError, isFetching } = useGetBatchDetailQuery(id, {
    skip: !isAdmin,
  });
  const [editing, setEditing] = useState(false);

  return (
    <RoleGate allow="admin">
      <DashboardShell
        sections={adminSections}
        footerItems={adminFooterItems}
        brandHref="/admin"
      >
        {isLoading ? (
          <p className="text-label-uppercase text-on-surface-variant uppercase">
            Memuat detail kelas…
          </p>
        ) : isError || !data ? (
          <div className="flex flex-col gap-4 items-start">
            <p className="text-label-uppercase text-error uppercase">
              Kelas tidak ditemukan.
            </p>
            <Link
              href="/admin/classes"
              className="text-label-uppercase text-primary hover:text-accent transition-colors uppercase"
            >
              ← Kembali ke daftar kelas
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-10 max-w-5xl">
            <BatchHeader
              batch={data.batch}
              onEdit={() => setEditing(true)}
              isFetching={isFetching}
            />
            <PendingTable pending={data.pending} />
            <StudentTable students={data.students} kuota={data.batch.kuota} />
          </div>
        )}

        <Modal
          open={editing}
          onClose={() => setEditing(false)}
          title="EDIT BATCH"
        >
          {editing && data && (
            <BatchForm batch={data.batch} onDone={() => setEditing(false)} />
          )}
        </Modal>
      </DashboardShell>
    </RoleGate>
  );
}

function BatchHeader({
  batch,
  onEdit,
  isFetching,
}: {
  batch: ModellingBatch;
  onEdit: () => void;
  isFetching: boolean;
}) {
  return (
    <header className="flex flex-col gap-5">
      <Link
        href="/admin/classes"
        className="text-label-uppercase text-secondary hover:text-accent transition-colors uppercase"
      >
        ← Semua Kelas
      </Link>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-label-uppercase text-secondary uppercase mb-1">
            BATCH {String(batch.batchKe).padStart(2, "0")} ·{" "}
            {formatDate(batch.tglMulai)} – {formatDate(batch.tglBerakhir)}
          </p>
          <h1
            className="font-display text-primary uppercase leading-[0.9] tracking-[-0.03em] font-bold"
            style={{ fontSize: "clamp(28px, 4vw, 44px)" }}
          >
            {batch.namaBatch}
          </h1>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="px-5 py-3 border border-outline text-secondary text-label-uppercase hover:text-accent hover:border-accent transition-colors uppercase"
        >
          Edit Batch
        </button>
      </div>

      <dl className="grid grid-cols-2 md:grid-cols-4 gap-px bg-outline-variant border border-outline-variant">
        <Stat label="Murid Join" value={`${batch.muridCount}/${batch.kuota}`} />
        <Stat label="Lulus" value={String(batch.lulusCount)} />
        <Stat
          label="Menunggu"
          value={String(batch.pendingCount)}
        />
        <Stat
          label="Pendaftaran"
          value={batch.statusPendaftaran === "buka" ? "BUKA" : "TUTUP"}
        />
      </dl>

      {isFetching && (
        <p className="text-caption text-secondary uppercase tracking-[0.1em]">
          Memuat ulang…
        </p>
      )}
    </header>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface p-5">
      <dt className="text-label-uppercase text-secondary uppercase mb-2">
        {label}
      </dt>
      <dd className="font-display text-headline-md text-primary tabular-nums leading-none">
        {value}
      </dd>
    </div>
  );
}

// --- Antrean pendaftaran (belum diputuskan) --------------------------------

function PendingTable({ pending }: { pending: ClassRegistration[] }) {
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<ClassRegistration | null>(null);

  const pageCount = Math.max(1, Math.ceil(pending.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const rows = pending.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap justify-between items-end border-b border-outline-variant pb-4 gap-4">
        <h2 className="font-display text-headline-md text-primary uppercase">
          Pendaftaran Masuk
        </h2>
        <p className="text-label-uppercase text-secondary uppercase">
          {pending.length} menunggu keputusan
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[640px]">
          <thead>
            <tr className="border-b border-outline-variant">
              <th className={`${thClass} pr-4 w-12`}>No</th>
              <th className={thClass}>Nama</th>
              <th className={thClass}>Telepon</th>
              <th className={thClass}>Tanggal Daftar</th>
              <th className={thClass}>Status</th>
              <th className={`${thClass} text-right`}>Aksi</th>
            </tr>
          </thead>
          <tbody className="text-body-md">
            {pending.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-secondary">
                  Tidak ada pendaftaran yang menunggu di batch ini.
                </td>
              </tr>
            ) : (
              rows.map((r, i) => (
                <tr
                  key={r.id}
                  className="border-b border-outline-variant hover:bg-surface-container-low transition-colors"
                >
                  <td className="py-4 pr-4 text-secondary tabular-nums">
                    {(safePage - 1) * PAGE_SIZE + i + 1}
                  </td>
                  <td className="py-4 text-primary font-medium">{r.name}</td>
                  <td className="py-4 text-secondary">{r.noTelepon}</td>
                  <td className="py-4 text-secondary">{formatDate(r.appliedAt)}</td>
                  <td className="py-4">
                    <span
                      className={`inline-flex items-center gap-2 border px-2 py-1 text-label-uppercase uppercase ${regStatusMeta[r.status].className}`}
                    >
                      <span className="w-1.5 h-1.5 bg-current" aria-hidden="true" />
                      {regStatusMeta[r.status].label}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <button
                      type="button"
                      onClick={() => setDetail(r)}
                      className="px-3 py-2 text-label-uppercase uppercase border border-outline text-secondary hover:text-accent hover:border-accent transition-colors"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pending.length > 0 && (
        <Pagination
          page={safePage}
          pageSize={PAGE_SIZE}
          total={pending.length}
          onPageChange={setPage}
        />
      )}

      <Modal
        open={detail !== null}
        onClose={() => setDetail(null)}
        title="DETAIL PENDAFTARAN KELAS"
      >
        {detail && (
          <RegistrationReview reg={detail} onDone={() => setDetail(null)} />
        )}
      </Modal>
    </section>
  );
}

// Status TIDAK diubah manual: membuka review ini otomatis menandai pendaftaran
// IN PROGRESS (sedang ditinjau); Terima/Tolak yang memutuskan. Biodata submitted
// ditampilkan lengkap — form kelas memakai template yang sama dengan form talent.
function RegistrationReview({
  reg,
  onDone,
}: {
  reg: ClassRegistration;
  onDone: () => void;
}) {
  const [update, { isLoading }] = useUpdateClassRegistrationMutation();

  // `reg` adalah snapshot baris saat modal dibuka — status live dilacak lokal
  // supaya badge langsung menunjukkan IN PROGRESS setelah auto-proses.
  const [status, setStatus] = useState<ClassRegistrationStatus>(reg.status);
  const autoProcessed = useRef(false);
  useEffect(() => {
    if (reg.status === "submitted" && !autoProcessed.current) {
      autoProcessed.current = true;
      update({ id: reg.id, status: "in_progress" });
      setStatus("in_progress");
    }
  }, [reg.status, reg.id, update]);

  async function act(next: ClassRegistrationStatus) {
    if (next === "rejected" && !window.confirm(`Tolak pendaftaran ${reg.name}?`))
      return;
    await update({ id: reg.id, status: next });
    onDone();
  }

  // Baris lama (sebelum form kelas memakai biodata lengkap) berisi placeholder
  // "-" — jangan dirender sebagai gambar/nilai.
  const hasFoto = reg.fotoProfil && reg.fotoProfil !== "-";
  const val = (v: string) => (v && v !== "-" ? v : "—");

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-5 border-b border-outline-variant pb-5">
        {hasFoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={reg.fotoProfil}
            alt={reg.name}
            className="w-32 h-40 object-cover border border-outline-variant shrink-0 bg-surface-container-low"
          />
        ) : (
          <div className="w-32 h-40 border border-outline-variant shrink-0 grid place-items-center text-caption text-on-surface-variant uppercase">
            No Foto
          </div>
        )}
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 flex-1 min-w-[14rem]">
          <DetailItem label="Nama" value={reg.name} />
          <DetailItem label="Gender" value={reg.gender.toUpperCase()} />
          <DetailItem label="Tanggal Lahir" value={val(reg.tanggalLahir)} />
          <DetailItem
            label="Tinggi"
            value={reg.tinggiBadan > 0 ? `${reg.tinggiBadan} Cm` : "—"}
          />
          <DetailItem
            label="Berat"
            value={reg.beratBadan > 0 ? `${reg.beratBadan} Kg` : "—"}
          />
          <DetailItem label="Size Baju" value={val(reg.sizeBaju)} />
          <DetailItem label="Size Sepatu" value={val(reg.sizeSepatu)} />
          <DetailItem label="No. Identitas" value={val(reg.noIdentitas)} />
          <DetailItem label="No. Telepon" value={reg.noTelepon} />
          <DetailItem
            label="Instagram"
            value={reg.instagram ? `@${reg.instagram}` : "—"}
          />
          <DetailItem label="Batch" value={reg.batchLabel} />
          <DetailItem label="Tanggal Mendaftar" value={formatDate(reg.appliedAt)} />
          <DetailItem label="Status" value={regStatusMeta[status].label} />
        </dl>
      </div>
      <p className="text-caption text-secondary tracking-[0.06em]">
        Bukti pembayaran ditangani offline di luar aplikasi. Diterima → murid
        masuk daftar kelas (talent_batch) dan bisa dinilai kelulusannya.
      </p>
      <div className="flex justify-end gap-3">
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

// --- Tabel murid (talent_batch) --------------------------------------------

function StudentTable({
  students,
  kuota,
}: {
  students: BatchStudent[];
  kuota: number;
}) {
  const [page, setPage] = useState(1);
  const [certFor, setCertFor] = useState<BatchStudent | null>(null);

  const pageCount = Math.max(1, Math.ceil(students.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const rows = students.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap justify-between items-end border-b border-outline-variant pb-4 gap-4">
        <div>
          <h2 className="font-display text-headline-md text-primary uppercase">
            Murid Kelas
          </h2>
          <p className="text-caption text-secondary uppercase tracking-[0.08em] mt-1">
            Baris talent_batch — murid yang diterima & join batch ini
          </p>
        </div>
        <p className="text-label-uppercase text-secondary uppercase">
          {students.length} dari kuota {kuota}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[820px]">
          <thead>
            <tr className="border-b border-outline-variant">
              <th className={`${thClass} pr-4 w-12`}>No</th>
              <th className={thClass}>Nama</th>
              <th className={thClass}>Kontak</th>
              <th className={thClass}>Tgl Join</th>
              <th className={thClass}>Kelulusan</th>
              <th className={thClass}>Sertifikat</th>
            </tr>
          </thead>
          <tbody className="text-body-md">
            {students.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-secondary">
                  Belum ada murid di batch ini. Terima pendaftaran di atas untuk
                  menambahkan murid.
                </td>
              </tr>
            ) : (
              rows.map((s, i) => (
                <StudentRow
                  key={s.idTalentBatch}
                  student={s}
                  index={(safePage - 1) * PAGE_SIZE + i + 1}
                  onUploadCert={() => setCertFor(s)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {students.length > 0 && (
        <Pagination
          page={safePage}
          pageSize={PAGE_SIZE}
          total={students.length}
          onPageChange={setPage}
        />
      )}

      <Modal
        open={certFor !== null}
        onClose={() => setCertFor(null)}
        title="SERTIFIKAT KELULUSAN"
      >
        {certFor && (
          <CertificateForm
            key={certFor.idTalentBatch}
            student={certFor}
            onDone={() => setCertFor(null)}
          />
        )}
      </Modal>
    </section>
  );
}

function StudentRow({
  student,
  index,
  onUploadCert,
}: {
  student: BatchStudent;
  index: number;
  onUploadCert: () => void;
}) {
  const [update, { isLoading }] = useUpdateClassRegistrationMutation();

  return (
    <tr className="border-b border-outline-variant hover:bg-surface-container-low transition-colors">
      <td className="py-4 pr-4 text-secondary tabular-nums">{index}</td>
      <td className="py-4 text-primary font-medium">{student.name}</td>
      <td className="py-4 text-secondary">
        <span className="block">{student.noTelepon}</span>
        <span className="block text-caption text-on-surface-variant truncate max-w-[14rem]">
          {student.email}
        </span>
      </td>
      <td className="py-4 text-secondary">{formatDate(student.joinedAt)}</td>
      <td className="py-4">
        <select
          aria-label={`Status kelulusan ${student.name}`}
          value={student.statusLulus}
          disabled={isLoading}
          onChange={(e) =>
            update({
              id: student.id,
              statusLulus: e.target.value as GraduationStatus,
            })
          }
          className={`border bg-transparent px-2 py-1.5 text-label-uppercase uppercase appearance-none cursor-pointer focus:outline-none focus:border-primary disabled:opacity-50 ${gradeStyle[student.statusLulus]}`}
        >
          {gradeOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </td>
      <td className="py-4">
        {student.statusLulus !== "lulus" ? (
          // Sertifikat hanya relevan untuk murid yang LULUS.
          <span className="text-caption text-on-surface-variant uppercase tracking-[0.1em]">
            —
          </span>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            {student.sertifikatUrl && (
              <a
                href={student.sertifikatUrl}
                download={`sertifikat-${student.name}.pdf`}
                className="text-label-uppercase text-primary hover:text-accent transition-colors uppercase"
              >
                ✓ Lihat
              </a>
            )}
            <button
              type="button"
              onClick={onUploadCert}
              className="px-3 py-2 text-label-uppercase uppercase border border-outline text-secondary hover:text-accent hover:border-accent transition-colors"
            >
              {student.sertifikatUrl ? "Ganti" : "Unggah"}
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}

// Unggah dokumen sertifikat (PDF) untuk satu murid → talent_batch.sertifikat_url.
function CertificateForm({
  student,
  onDone,
}: {
  student: BatchStudent;
  onDone: () => void;
}) {
  const [update, { isLoading }] = useUpdateClassRegistrationMutation();
  const [file, setFile] = useState<PickedFile | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (!file?.dataUrl) {
      setError("Pilih berkas sertifikat terlebih dahulu.");
      return;
    }
    setError(null);
    try {
      await update({ id: student.id, sertifikatUrl: file.dataUrl }).unwrap();
      onDone();
    } catch {
      setError("Gagal menyimpan sertifikat. Coba lagi.");
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 border-b border-outline-variant pb-5">
        <DetailItem label="Murid" value={student.name} />
        <DetailItem label="Tanggal Join" value={formatDate(student.joinedAt)} />
      </dl>

      {student.sertifikatUrl && (
        <a
          href={student.sertifikatUrl}
          download={`sertifikat-${student.name}.pdf`}
          className="text-label-uppercase text-primary hover:text-accent transition-colors uppercase"
        >
          ✓ Sertifikat saat ini — unduh
        </a>
      )}

      <FileField
        label={student.sertifikatUrl ? "Ganti sertifikat" : "Unggah sertifikat"}
        accept="application/pdf,image/*"
        hint="PDF atau gambar sertifikat"
        value={file}
        onChange={setFile}
      />

      {error && (
        <p className="text-caption text-error uppercase tracking-[0.1em]">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onDone}
          className="px-6 py-3 border border-outline text-secondary text-label-uppercase hover:text-accent hover:border-accent transition-colors uppercase"
        >
          Batal
        </button>
        <button
          type="button"
          onClick={save}
          disabled={isLoading}
          className="px-6 py-3 bg-primary text-on-primary text-label-uppercase hover:bg-accent transition-colors uppercase disabled:opacity-50"
        >
          {isLoading ? "MENYIMPAN…" : "Simpan Sertifikat"}
        </button>
      </div>
    </div>
  );
}
