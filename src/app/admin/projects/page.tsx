"use client";

import { useMemo, useState } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Pagination } from "@/components/Pagination";
import { Modal } from "@/components/Modal";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { adminFooterItems, adminSections } from "@/components/admin/adminNav";
import { RoleGate } from "@/components/auth/RoleGate";
import { useAppSelector } from "@/store/hooks";
import {
  useGetAllProjectsQuery,
  useDeleteProjectMutation,
  type Project,
  type ProjectType,
} from "@/store/api/projectsApi";

const PAGE_SIZE = 8;

const typeLabel: Record<ProjectType, string> = {
  event: "EVENT",
  photoshoot: "PHOTOSHOOT",
  other: "OTHER",
};

const filters: { label: string; value: "all" | ProjectType }[] = [
  { label: "SEMUA", value: "all" },
  { label: "EVENT", value: "event" },
  { label: "PHOTOSHOOT", value: "photoshoot" },
  { label: "OTHER", value: "other" },
];

export default function AdminProjectsPage() {
  const isAdmin = useAppSelector((s) => s.auth.user?.role === "admin");
  const { data, isLoading, isError, isFetching } = useGetAllProjectsQuery(
    undefined,
    { skip: !isAdmin },
  );
  const [deleteProject] = useDeleteProjectMutation();

  const [filter, setFilter] = useState<"all" | ProjectType>("all");
  const [page, setPage] = useState(1);
  // null = tertutup; { project } = edit; { project: null } = tambah baru.
  const [modal, setModal] = useState<{ project: Project | null } | null>(null);

  const projects = useMemo(() => data ?? [], [data]);
  const visible = useMemo(
    () =>
      filter === "all" ? projects : projects.filter((p) => p.type === filter),
    [projects, filter],
  );

  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const paged = visible.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function changeFilter(value: "all" | ProjectType) {
    setFilter(value);
    setPage(1);
  }

  async function handleDelete(p: Project) {
    if (
      !window.confirm(
        `Hapus "${p.title}" dari halaman publik? Tindakan ini tidak bisa dibatalkan.`,
      )
    )
      return;
    await deleteProject(p.slug);
    if (modal?.project?.slug === p.slug) setModal(null);
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
            Memuat project…
          </p>
        ) : isError ? (
          <p className="text-label-uppercase text-error uppercase">
            Gagal memuat project.
          </p>
        ) : (
          <div className="flex flex-col gap-6">
            <header className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-label-uppercase text-secondary uppercase mb-1">
                  AGENCY · PROJECTS
                </p>
                <h1
                  className="font-display text-primary uppercase leading-[0.9] tracking-[-0.03em] font-bold"
                  style={{ fontSize: "clamp(28px, 4vw, 44px)" }}
                >
                  PROJECTS
                </h1>
                <p className="text-body-md text-secondary max-w-prose mt-2">
                  Apa pun yang Anda publikasikan di sini langsung tampil di
                  halaman Projects pada situs publik.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModal({ project: null })}
                className="px-5 py-3 bg-primary text-on-primary text-label-uppercase hover:bg-accent transition-colors uppercase"
              >
                + Tambah Project
              </button>
            </header>

            <section className="flex flex-col gap-4">
              <div className="flex flex-wrap justify-between items-end border-b border-outline-variant pb-3 gap-3">
                <h2 className="font-display text-headline-md text-primary uppercase">
                  ALL PROJECTS
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
                        Project
                      </th>
                      <th className="py-3 text-label-uppercase text-secondary font-normal uppercase">
                        Event
                      </th>
                      <th className="py-3 text-label-uppercase text-secondary font-normal uppercase">
                        Tipe
                      </th>
                      <th className="py-3 text-label-uppercase text-secondary font-normal uppercase">
                        Tanggal
                      </th>
                      <th className="py-3 text-right text-label-uppercase text-secondary font-normal uppercase">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-body-md">
                    {visible.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-secondary">
                          Belum ada project pada tipe ini.
                        </td>
                      </tr>
                    ) : (
                      paged.map((p, i) => (
                        <tr
                          key={p.id}
                          className="border-b border-outline-variant hover:bg-surface-container-low transition-colors"
                        >
                          <td className="py-3 pr-4 text-secondary tabular-nums">
                            {(safePage - 1) * PAGE_SIZE + i + 1}
                          </td>
                          <td className="py-3">
                            <div className="flex items-center gap-3">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={p.cover}
                                alt={p.coverAlt}
                                className="h-12 w-16 object-cover border border-outline-variant shrink-0"
                              />
                              <span className="text-primary font-medium">
                                {p.title}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 text-secondary">{p.event}</td>
                          <td className="py-3 text-secondary">
                            {typeLabel[p.type]}
                          </td>
                          <td className="py-3 text-secondary whitespace-nowrap">
                            {p.dateLabel}
                          </td>
                          <td className="py-3 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => setModal({ project: p })}
                              className="text-label-uppercase text-primary hover:text-accent transition-colors uppercase"
                            >
                              Edit
                            </button>
                            <span className="text-outline-variant px-2">/</span>
                            <button
                              type="button"
                              onClick={() => handleDelete(p)}
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
          title={modal?.project ? "EDIT PROJECT" : "TAMBAH PROJECT"}
        >
          {modal !== null && (
            <ProjectForm
              key={modal.project?.slug ?? "new"}
              editing={modal.project}
              onDone={() => setModal(null)}
            />
          )}
        </Modal>
      </DashboardShell>
    </RoleGate>
  );
}
