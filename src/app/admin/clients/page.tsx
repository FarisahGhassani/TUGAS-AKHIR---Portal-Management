"use client";

import { useMemo, useState } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Pagination } from "@/components/Pagination";
import { Modal } from "@/components/Modal";
import { adminFooterItems, adminSections } from "@/components/admin/adminNav";
import { RoleGate } from "@/components/auth/RoleGate";
import { useAppSelector } from "@/store/hooks";
import {
  useGetAllInquiriesQuery,
  useUpdateInquiryMutation,
  type ClientInquiry,
  type InquiryStatus,
} from "@/store/api/inquiryApi";

const PAGE_SIZE = 8;

const statusMeta: Record<
  InquiryStatus,
  { label: string; className: string }
> = {
  submitted: { label: "SUBMITTED", className: "border-accent text-accent" },
  in_progress: {
    label: "IN PROGRESS",
    className: "border-primary text-primary",
  },
  completed: {
    label: "COMPLETED",
    className: "border-outline-variant text-secondary",
  },
};

const filters: { label: string; value: "all" | InquiryStatus }[] = [
  { label: "SEMUA", value: "all" },
  { label: "SUBMITTED", value: "submitted" },
  { label: "IN PROGRESS", value: "in_progress" },
  { label: "COMPLETED", value: "completed" },
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

function formatRange(start?: string, end?: string) {
  if (!start && !end) return "—";
  if (start && end) return `${formatDate(start)} – ${formatDate(end)}`;
  return formatDate(start || end);
}

export default function AdminClientsPage() {
  const isAdmin = useAppSelector((s) => s.auth.user?.role === "admin");
  const { data, isLoading, isError, isFetching } = useGetAllInquiriesQuery(
    undefined,
    { skip: !isAdmin },
  );

  const [filter, setFilter] = useState<"all" | InquiryStatus>("all");
  const [page, setPage] = useState(1);
  const [active, setActive] = useState<ClientInquiry | null>(null);

  const list = useMemo(() => data ?? [], [data]);
  const visible = useMemo(
    () => (filter === "all" ? list : list.filter((i) => i.status === filter)),
    [list, filter],
  );

  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const paged = visible.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  function changeFilter(value: "all" | InquiryStatus) {
    setFilter(value);
    setPage(1);
  }

  return (
    <RoleGate allow="admin">
      <DashboardShell
        sections={adminSections}
        footerItems={adminFooterItems}
        brandHref="/admin"
      >
        {isLoading ? (
          <p className="text-label-uppercase text-on-surface-variant uppercase">
            Memuat inquiry klien…
          </p>
        ) : isError ? (
          <p className="text-label-uppercase text-error uppercase">
            Gagal memuat inquiry klien.
          </p>
        ) : (
          <div className="flex flex-col gap-6">
            <header>
              <p className="text-label-uppercase text-secondary uppercase mb-1">
                PEOPLE · CLIENTS
              </p>
              <h1
                className="font-display text-primary uppercase leading-[0.9] tracking-[-0.03em] font-bold"
                style={{ fontSize: "clamp(28px, 4vw, 44px)" }}
              >
                CLIENT INQUIRIES
              </h1>
              <p className="text-body-md text-secondary max-w-prose mt-2">
                Brief proyek yang masuk dari klien. Perbarui status dan tinggalkan
                catatan — keduanya langsung terlihat oleh klien saat memantau
                pengajuannya.
              </p>
            </header>

            <section className="flex flex-col gap-4">
              <div className="flex flex-wrap justify-between items-end border-b border-outline-variant pb-3 gap-3">
                <h2 className="font-display text-headline-md text-primary uppercase">
                  INBOX
                </h2>
                <div className="flex gap-2 flex-wrap">
                  {filters.map((f) => {
                    const activeF = filter === f.value;
                    return (
                      <button
                        key={f.value}
                        type="button"
                        onClick={() => changeFilter(f.value)}
                        className={`px-3 py-2 text-label-uppercase uppercase transition-colors border ${
                          activeF
                            ? "bg-primary text-on-primary border-primary"
                            : "border-outline text-secondary hover:text-accent"
                        }`}
                      >
                        {f.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {isFetching && (
                <p className="text-caption text-secondary uppercase tracking-[0.1em]">
                  Memuat ulang…
                </p>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[760px]">
                  <thead>
                    <tr className="border-b border-outline-variant">
                      <th className="py-3 pr-4 text-label-uppercase text-secondary font-normal uppercase w-12">
                        No
                      </th>
                      <th className="py-3 text-label-uppercase text-secondary font-normal uppercase">
                        Proyek
                      </th>
                      <th className="py-3 text-label-uppercase text-secondary font-normal uppercase">
                        Klien
                      </th>
                      <th className="py-3 text-label-uppercase text-secondary font-normal uppercase">
                        Jenis
                      </th>
                      <th className="py-3 text-label-uppercase text-secondary font-normal uppercase">
                        Tgl Proyek
                      </th>
                      <th className="py-3 text-label-uppercase text-secondary font-normal uppercase">
                        Status
                      </th>
                      <th className="py-3 text-right text-label-uppercase text-secondary font-normal uppercase">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-body-md align-top">
                    {visible.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="py-8 text-center text-secondary"
                        >
                          Tidak ada inquiry dengan status ini.
                        </td>
                      </tr>
                    ) : (
                      paged.map((inq, i) => (
                        <tr
                          key={inq.id}
                          className="border-b border-outline-variant hover:bg-surface-container-low transition-colors"
                        >
                          <td className="py-3 pr-4 text-secondary tabular-nums">
                            {(safePage - 1) * PAGE_SIZE + i + 1}
                          </td>
                          <td className="py-3 pr-4">
                            <p className="text-primary font-medium">
                              {inq.judulProject}
                            </p>
                            {inq.brand && (
                              <p className="text-caption text-on-surface-variant uppercase tracking-[0.08em]">
                                {inq.brand}
                              </p>
                            )}
                          </td>
                          <td className="py-3 pr-4 text-secondary">
                            <p>{inq.namaClient}</p>
                            <p className="text-caption text-on-surface-variant">
                              {inq.noTelepon}
                            </p>
                          </td>
                          <td className="py-3 text-secondary">{inq.jenisJob}</td>
                          <td className="py-3 text-secondary whitespace-nowrap">
                            {formatRange(inq.tanggalProject, inq.tanggalProjectSelesai)}
                          </td>
                          <td className="py-3">
                            <StatusBadge status={inq.status} />
                          </td>
                          <td className="py-3 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => setActive(inq)}
                              className="text-label-uppercase text-primary hover:text-accent transition-colors uppercase"
                            >
                              Kelola
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {visible.length > 0 && (
                <Pagination
                  page={safePage}
                  pageSize={PAGE_SIZE}
                  total={visible.length}
                  onPageChange={setPage}
                />
              )}
            </section>
          </div>
        )}

        <Modal
          open={active !== null}
          onClose={() => setActive(null)}
          title="KELOLA INQUIRY"
        >
          {active && (
            <ManageInquiry
              key={active.id}
              inquiry={active}
              onDone={() => setActive(null)}
            />
          )}
        </Modal>
      </DashboardShell>
    </RoleGate>
  );
}

function ManageInquiry({
  inquiry,
  onDone,
}: {
  inquiry: ClientInquiry;
  onDone: () => void;
}) {
  const [updateInquiry, { isLoading }] = useUpdateInquiryMutation();
  // Lazy initial state; pemanggil memberi `key={inquiry.id}` sehingga komponen
  // remount saat memilih inquiry lain (tidak perlu sinkronisasi via effect).
  const [status, setStatus] = useState<InquiryStatus>(inquiry.status);
  const [catatanAdmin, setCatatanAdmin] = useState(inquiry.catatanAdmin ?? "");
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setError(null);
    try {
      await updateInquiry({
        id: inquiry.id,
        status,
        catatanAdmin: catatanAdmin.trim(),
      }).unwrap();
      onDone();
    } catch {
      setError("Gagal menyimpan perubahan.");
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Ringkasan brief — read-only, supaya admin punya konteks. */}
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 border-b border-outline-variant pb-5">
        <Detail label="Proyek" value={inquiry.judulProject} />
        <Detail label="Klien" value={inquiry.namaClient} />
        <Detail label="Telepon" value={inquiry.noTelepon} />
        <Detail label="Jenis Job" value={inquiry.jenisJob} />
        {inquiry.brand && <Detail label="Brand" value={inquiry.brand} />}
        {inquiry.modelPilihan && (
          <Detail label="Model Pilihan" value={inquiry.modelPilihan} />
        )}
        {inquiry.catatanClient && (
          <div className="sm:col-span-2">
            <Detail label="Catatan Klien" value={inquiry.catatanClient} />
          </div>
        )}
      </dl>

      <div>
        <label htmlFor="inq-status" className="text-label-uppercase text-secondary block uppercase mb-2">
          Status
        </label>
        <select
          id="inq-status"
          value={status}
          onChange={(e) => setStatus(e.target.value as InquiryStatus)}
          className="w-full border-0 border-b border-outline bg-transparent px-0 py-2 focus:outline-none focus:border-primary text-body-md text-primary appearance-none rounded-none cursor-pointer pr-8 transition-colors"
        >
          <option value="submitted">SUBMITTED</option>
          <option value="in_progress">IN PROGRESS</option>
          <option value="completed">COMPLETED</option>
        </select>
      </div>

      <div>
        <label htmlFor="inq-note" className="text-label-uppercase text-secondary block uppercase mb-2">
          Catatan untuk klien
        </label>
        <textarea
          id="inq-note"
          value={catatanAdmin}
          onChange={(e) => setCatatanAdmin(e.target.value)}
          rows={3}
          placeholder="mis. Kami sedang menyiapkan opsi portfolio talent…"
          className="w-full border border-outline-variant bg-transparent p-3 focus:outline-none focus:border-primary text-body-md text-primary placeholder:text-outline-variant resize-none"
        />
      </div>

      {error && (
        <p className="text-caption text-error uppercase tracking-[0.1em]">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onDone}
          className="px-6 py-3 border border-outline text-secondary text-label-uppercase hover:text-accent hover:border-accent transition-colors uppercase"
        >
          Batal
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isLoading}
          className="px-6 py-3 bg-primary text-on-primary text-label-uppercase hover:bg-accent transition-colors uppercase disabled:opacity-50"
        >
          {isLoading ? "MENYIMPAN…" : "Simpan"}
        </button>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-label-uppercase text-secondary uppercase mb-1">
        {label}
      </dt>
      <dd className="text-body-md text-primary">{value}</dd>
    </div>
  );
}

function StatusBadge({ status }: { status: InquiryStatus }) {
  const meta = statusMeta[status];
  return (
    <span
      className={`inline-flex items-center gap-2 border px-3 py-1 text-label-uppercase uppercase ${meta.className}`}
    >
      <span className="w-1.5 h-1.5 bg-current" aria-hidden="true" />
      {meta.label}
    </span>
  );
}
