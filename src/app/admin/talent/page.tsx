"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Pagination } from "@/components/Pagination";
import { Modal } from "@/components/Modal";
import { TalentForm } from "@/components/admin/TalentForm";
import { adminFooterItems, adminSections } from "@/components/admin/adminNav";
import { RoleGate } from "@/components/auth/RoleGate";
import { useAppSelector } from "@/store/hooks";
import {
  useGetAllTalentsQuery,
  useDeleteTalentMutation,
  useGetTalentApplicationsQuery,
  useGetTalentApplicationDetailQuery,
  useUpdateTalentApplicationMutation,
  type Talent,
  type TalentApplicationStatus,
  type TalentGender,
} from "@/store/api/talentApi";

const appStatusMeta: Record<
  TalentApplicationStatus,
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

const PAGE_SIZE = 8;

const categoryLabel: Record<Talent["categories"][number], string> = {
  photoshoot: "PHOTOSHOOT",
  runway: "RUNWAY",
  tvc: "TVC",
  commercial: "COMMERCIAL",
  "muse-beauty": "MUSE / BEAUTY",
};

const filters: { label: string; value: "all" | TalentGender }[] = [
  { label: "SEMUA", value: "all" },
  { label: "FEMALE", value: "female" },
  { label: "MALE", value: "male" },
];

export default function AdminTalentPage() {
  const isAdmin = useAppSelector((s) => s.auth.user?.role === "admin");
  const { data, isLoading, isError, isFetching } = useGetAllTalentsQuery(
    undefined,
    { skip: !isAdmin },
  );
  const [deleteTalent] = useDeleteTalentMutation();

  const [filter, setFilter] = useState<"all" | TalentGender>("all");
  const [page, setPage] = useState(1);
  // null = modal tertutup; { talent } = edit; { talent: null } = tambah baru.
  const [modal, setModal] = useState<{ talent: Talent | null } | null>(null);

  const talents = useMemo(() => data ?? [], [data]);
  const visible = useMemo(
    () =>
      filter === "all"
        ? talents
        : talents.filter((t) => t.gender === filter),
    [talents, filter],
  );

  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const paged = visible.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  function changeFilter(value: "all" | TalentGender) {
    setFilter(value);
    setPage(1);
  }

  async function handleDelete(t: Talent) {
    if (
      !window.confirm(
        `Hapus ${t.name} dari katalog? Tindakan ini tidak bisa dibatalkan.`,
      )
    )
      return;
    await deleteTalent(t.slug);
    if (modal?.talent?.slug === t.slug) setModal(null);
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
            Memuat roster talent…
          </p>
        ) : isError ? (
          <p className="text-label-uppercase text-error uppercase">
            Gagal memuat roster talent.
          </p>
        ) : (
          <div className="flex flex-col gap-6 max-w-5xl">
            <header className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-label-uppercase text-secondary uppercase mb-1">
                  PEOPLE · TALENT
                </p>
                <h1
                  className="font-display text-primary uppercase leading-[0.9] tracking-[-0.03em] font-bold"
                  style={{ fontSize: "clamp(28px, 4vw, 44px)" }}
                >
                  TALENT ROSTER
                </h1>
              </div>
              <button
                type="button"
                onClick={() => setModal({ talent: null })}
                className="px-5 py-3 bg-primary text-on-primary text-label-uppercase hover:bg-accent transition-colors uppercase"
              >
                + Tambah Talent
              </button>
            </header>

            <TalentApplicationsPanel />

            <section className="flex flex-col gap-4">
              <div className="flex flex-wrap justify-between items-end border-b border-outline-variant pb-3 gap-3">
                <h2 className="font-display text-headline-md text-primary uppercase">
                  ROSTER
                </h2>
                <div className="flex gap-2 flex-wrap">
                  {filters.map((f) => {
                    const active = filter === f.value;
                    return (
                      <button
                        key={f.value}
                        type="button"
                        onClick={() => changeFilter(f.value)}
                        className={`px-3 py-2 text-label-uppercase uppercase transition-colors border ${
                          active
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
                <table className="w-full text-left border-collapse min-w-[720px]">
                  <thead>
                    <tr className="border-b border-outline-variant">
                      <th className="py-3 pr-4 text-label-uppercase text-secondary font-normal uppercase w-12">
                        No
                      </th>
                      <th className="py-3 text-label-uppercase text-secondary font-normal uppercase">
                        Talent
                      </th>
                      <th className="py-3 text-label-uppercase text-secondary font-normal uppercase">
                        Gender
                      </th>
                      <th className="py-3 text-label-uppercase text-secondary font-normal uppercase">
                        Tinggi
                      </th>
                      <th className="py-3 text-label-uppercase text-secondary font-normal uppercase">
                        Kategori
                      </th>
                      <th className="py-3 text-right text-label-uppercase text-secondary font-normal uppercase">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-body-md">
                    {visible.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-8 text-center text-secondary"
                        >
                          Belum ada talent untuk filter ini.
                        </td>
                      </tr>
                    ) : (
                      paged.map((t, i) => (
                        <tr
                          key={t.id}
                          className="border-b border-outline-variant hover:bg-surface-container-low transition-colors"
                        >
                          <td className="py-3 pr-4 text-secondary tabular-nums">
                            {(safePage - 1) * PAGE_SIZE + i + 1}
                          </td>
                          <td className="py-3">
                            <div className="flex items-center gap-3">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={t.cover}
                                alt={t.coverAlt}
                                className="h-12 w-10 object-cover grayscale border border-outline-variant shrink-0"
                              />
                              <div className="min-w-0">
                                <p className="text-primary font-medium truncate">
                                  {t.name}
                                </p>
                                <p className="text-caption text-on-surface-variant font-mono truncate">
                                  /{t.slug}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 text-secondary uppercase">
                            {t.gender}
                          </td>
                          <td className="py-3 text-secondary">
                            {t.heightCm} Cm
                            <span className="text-on-surface-variant">
                              {" "}
                              · {t.heightLabel}
                            </span>
                          </td>
                          <td className="py-3 text-secondary">
                            <span className="text-caption uppercase tracking-[0.08em]">
                              {t.categories
                                .map((c) => categoryLabel[c])
                                .join(" · ")}
                            </span>
                          </td>
                          <td className="py-3 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => setModal({ talent: t })}
                              className="text-label-uppercase text-primary hover:text-accent transition-colors uppercase"
                            >
                              Edit
                            </button>
                            <span className="text-outline-variant px-2">/</span>
                            <button
                              type="button"
                              onClick={() => handleDelete(t)}
                              className="text-label-uppercase text-secondary hover:text-error transition-colors uppercase"
                            >
                              Hapus
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
          open={modal !== null}
          onClose={() => setModal(null)}
          title={modal?.talent ? "EDIT TALENT" : "TAMBAH TALENT"}
        >
          {modal !== null && (
            <TalentForm
              key={modal.talent?.slug ?? "new"}
              editing={modal.talent}
              onDone={() => setModal(null)}
            />
          )}
        </Modal>
      </DashboardShell>
    </RoleGate>
  );
}

// Panel approval: pendaftaran talent dari dashboard. Approve → masuk katalog
// (admin lengkapi kategori/comcard via tombol Edit di roster).
function TalentApplicationsPanel() {
  const { data, isLoading, isError, isFetching } =
    useGetTalentApplicationsQuery();
  const [detailId, setDetailId] = useState<string | null>(null);

  const apps = data ?? [];

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap justify-between items-end border-b border-outline-variant pb-3 gap-3">
        <h2 className="font-display text-headline-md text-primary uppercase">
          TALENT APPLICATIONS
        </h2>
        {apps.length > 0 && (
          <span className="text-label-uppercase text-secondary uppercase">
            {apps.filter((a) => a.status === "submitted").length} new
          </span>
        )}
      </div>

      {isLoading ? (
        <p className="text-caption text-secondary uppercase tracking-[0.1em]">
          Memuat pendaftaran…
        </p>
      ) : isError ? (
        <p className="text-label-uppercase text-error uppercase">
          Gagal memuat pendaftaran.
        </p>
      ) : apps.length === 0 ? (
        <p className="text-label-uppercase text-on-surface-variant uppercase">
          Belum ada pendaftaran talent.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[680px]">
            <thead>
              <tr className="border-b border-outline-variant">
                <th className="py-3 pr-4 text-label-uppercase text-secondary font-normal uppercase w-12">
                  No
                </th>
                <th className="py-3 text-label-uppercase text-secondary font-normal uppercase">
                  Pelamar
                </th>
                <th className="py-3 text-label-uppercase text-secondary font-normal uppercase">
                  Gender
                </th>
                <th className="py-3 text-label-uppercase text-secondary font-normal uppercase">
                  Tinggi
                </th>
                <th className="py-3 text-label-uppercase text-secondary font-normal uppercase">
                  Status
                </th>
                <th className="py-3 text-right text-label-uppercase text-secondary font-normal uppercase">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="text-body-md">
              {apps.map((a, i) => (
                <tr
                  key={a.id}
                  className="border-b border-outline-variant hover:bg-surface-container-low transition-colors"
                >
                  <td className="py-3 pr-4 text-secondary tabular-nums">
                    {i + 1}
                  </td>
                  <td className="py-3">
                    <p className="text-primary font-medium">{a.name}</p>
                    <p className="text-caption text-on-surface-variant uppercase tracking-[0.08em]">
                      {a.appliedAt}
                    </p>
                  </td>
                  <td className="py-3 text-secondary uppercase">{a.gender}</td>
                  <td className="py-3 text-secondary">{a.heightCm} Cm</td>
                  <td className="py-3">
                    <span
                      className={`inline-flex items-center gap-2 border px-3 py-1 text-label-uppercase uppercase ${appStatusMeta[a.status].className}`}
                    >
                      <span
                        className="w-1.5 h-1.5 bg-current"
                        aria-hidden="true"
                      />
                      {appStatusMeta[a.status].label}
                    </span>
                  </td>
                  <td className="py-3 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => setDetailId(a.id)}
                      className="text-label-uppercase text-primary hover:text-accent transition-colors uppercase"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {isFetching && (
            <p className="text-caption text-secondary uppercase tracking-[0.1em] mt-2">
              Memperbarui…
            </p>
          )}
        </div>
      )}

      <Modal
        open={detailId !== null}
        onClose={() => setDetailId(null)}
        title="REVIEW PENDAFTARAN TALENT"
      >
        {detailId !== null && (
          <ApplicationReview id={detailId} onDone={() => setDetailId(null)} />
        )}
      </Modal>
    </section>
  );
}

// Review data submitted pelamar (foto + biodata lengkap) sebelum admin
// memutuskan. Data dibaca on-demand dari API detail via RTK.
//
// Status TIDAK diubah manual oleh admin — dia AKIBAT dari aksi admin:
// membuka review ini otomatis menandai pendaftaran IN PROGRESS (sedang
// ditinjau); klik Terima/Tolak yang memutuskan accepted/rejected.
function ApplicationReview({
  id,
  onDone,
}: {
  id: string;
  onDone: () => void;
}) {
  const { data, isLoading, isError } = useGetTalentApplicationDetailQuery(id);
  const [decide, { isLoading: deciding }] =
    useUpdateTalentApplicationMutation();

  // Auto-proses sekali per pembukaan modal: submitted → in_progress.
  const autoProcessed = useRef(false);
  useEffect(() => {
    if (data?.status === "submitted" && !autoProcessed.current) {
      autoProcessed.current = true;
      decide({ id, status: "in_progress" });
    }
  }, [data?.status, id, decide]);

  async function act(status: TalentApplicationStatus) {
    if (!data) return;
    if (status === "rejected" && !window.confirm(`Tolak pendaftaran ${data.name}?`))
      return;
    await decide({ id, status });
    onDone();
  }

  if (isLoading) {
    return (
      <p className="text-caption text-secondary uppercase tracking-[0.1em]">
        Memuat detail…
      </p>
    );
  }
  if (isError || !data) {
    return (
      <p className="text-label-uppercase text-error uppercase">
        Gagal memuat detail pendaftaran.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-5 border-b border-outline-variant pb-5">
        {data.fotoProfil ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.fotoProfil}
            alt={data.name}
            className="w-32 h-40 object-cover border border-outline-variant shrink-0 bg-surface-container-low"
          />
        ) : (
          <div className="w-32 h-40 border border-outline-variant shrink-0 grid place-items-center text-caption text-on-surface-variant uppercase">
            No Foto
          </div>
        )}
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 flex-1 min-w-[14rem]">
          <DetailItem label="Nama" value={data.name} />
          <DetailItem label="Gender" value={data.gender.toUpperCase()} />
          <DetailItem label="Tanggal Lahir" value={data.tanggalLahir} />
          <DetailItem label="Tinggi" value={`${data.heightCm} Cm`} />
          <DetailItem label="Berat" value={`${data.beratBadan} Kg`} />
          <DetailItem label="Size Baju" value={data.sizeBaju} />
          <DetailItem label="Size Sepatu" value={data.sizeSepatu} />
          <DetailItem label="No. Identitas" value={data.noIdentitas} />
          <DetailItem label="No. Telepon" value={data.noTelepon} />
          <DetailItem
            label="Instagram"
            value={data.instagram ? `@${data.instagram}` : "—"}
          />
          <DetailItem label="Tanggal Mendaftar" value={data.appliedAt} />
          <DetailItem label="Status" value={appStatusMeta[data.status].label} />
        </dl>
      </div>

      <div>
        <p className="text-label-uppercase text-secondary uppercase mb-2">
          Portofolio
        </p>
        {data.portofolioUrl ? (
          // Link milik talent (Drive / IG / dokumentasi) — isinya selalu versi
          // terbaru karena talent yang mengelola sendiri sumbernya.
          <a
            href={data.portofolioUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-body-md text-primary hover:text-accent transition-colors break-all underline underline-offset-4"
          >
            ↗ {data.portofolioUrl}
          </a>
        ) : (
          <p className="text-caption text-on-surface-variant uppercase tracking-[0.1em]">
            Tidak melampirkan link portofolio.
          </p>
        )}
      </div>

      <div className="flex justify-end gap-3">
        {data.status !== "rejected" && (
          <button
            type="button"
            disabled={deciding}
            onClick={() => act("rejected")}
            className="px-5 py-2.5 border border-outline text-secondary text-label-uppercase hover:text-error hover:border-error transition-colors uppercase disabled:opacity-50"
          >
            Tolak
          </button>
        )}
        {data.status !== "accepted" && (
          <button
            type="button"
            disabled={deciding}
            onClick={() => act("accepted")}
            className="px-6 py-2.5 bg-primary text-on-primary text-label-uppercase hover:bg-accent transition-colors uppercase disabled:opacity-50"
          >
            Terima
          </button>
        )}
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
