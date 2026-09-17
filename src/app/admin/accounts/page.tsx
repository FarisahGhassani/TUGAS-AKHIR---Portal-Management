"use client";

import { useMemo, useState, type ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Pagination } from "@/components/Pagination";
import { Modal } from "@/components/Modal";
import { adminFooterItems, adminSections } from "@/components/admin/adminNav";
import { RoleGate } from "@/components/auth/RoleGate";
import { useAppSelector } from "@/store/hooks";
import {
  useGetAccountsQuery,
  useGetAccountActivityQuery,
  useUpdateAccountRoleMutation,
  type EditableRole,
} from "@/store/api/adminApi";
import type { AuthRole } from "@/store/api/authApi";

// 10 baris per halaman, lalu Next (berlaku untuk semua tabel list).
const PAGE_SIZE = 10;

const roleStyle: Record<AuthRole, string> = {
  admin: "bg-primary text-on-primary",
  talent: "bg-surface-variant text-primary",
  client: "bg-surface-container-highest text-secondary",
};

const roleLabel: Record<AuthRole, string> = {
  admin: "ADMIN",
  talent: "TALENT",
  client: "CLIENT",
};

const filters: { label: string; value: "all" | AuthRole }[] = [
  { label: "SEMUA", value: "all" },
  { label: "ADMIN", value: "admin" },
  { label: "TALENT", value: "talent" },
  { label: "CLIENT", value: "client" },
];

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export default function AdminAccountsPage() {
  // Admin-only — sumber kebenaran role dari auth state (RTK); query di-skip
  // untuk non-admin.
  const isAdmin = useAppSelector((s) => s.auth.user?.role === "admin");
  const { data, isLoading, isError, isFetching } = useGetAccountsQuery(
    undefined,
    { skip: !isAdmin },
  );
  const [filter, setFilter] = useState<"all" | AuthRole>("all");
  const [page, setPage] = useState(1);
  // Akun yang detailnya sedang dibuka di modal (null = tertutup).
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const visibleAccounts = useMemo(() => {
    if (!data) return [];
    return filter === "all"
      ? data.accounts
      : data.accounts.filter((a) => a.role === filter);
  }, [data, filter]);

  // Potong sesuai halaman aktif. Halaman di-clamp agar tidak melebihi jumlah
  // data saat filter mempersempit hasil.
  const pageCount = Math.max(1, Math.ceil(visibleAccounts.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pagedAccounts = visibleAccounts.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  // Ganti filter selalu kembali ke halaman 1.
  function changeFilter(value: "all" | AuthRole) {
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
      {isLoading || !data ? (
        <p className="text-label-uppercase text-on-surface-variant uppercase">
          Memuat akun…
        </p>
      ) : isError ? (
        <p className="text-label-uppercase text-error uppercase">
          Gagal memuat akun.
        </p>
      ) : (
        <div className="flex flex-col gap-8">
          <header>
            <p className="text-label-uppercase text-secondary uppercase mb-2">
              PEOPLE · ACCOUNTS
            </p>
            <h1
              className="font-display text-primary uppercase leading-[0.9] tracking-[-0.03em] font-bold"
              style={{ fontSize: "clamp(32px, 5vw, 56px)" }}
            >
              REGISTERED ACCOUNTS
            </h1>
            <p className="text-body-md text-secondary max-w-prose mt-3">
              Semua akun yang terdaftar di portal, termasuk peran yang dipakai
              tiap akun saat masuk.
            </p>
          </header>

          <section className="flex flex-col gap-4">
            <div className="flex flex-wrap justify-between items-end border-b border-outline-variant pb-4 gap-4">
              <h2 className="font-display text-headline-md text-primary uppercase">
                ACCOUNT DIRECTORY
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
                    <th className="py-4 pr-4 text-label-uppercase text-secondary font-normal uppercase w-12">
                      No
                    </th>
                    <th className="py-4 text-label-uppercase text-secondary font-normal uppercase">
                      Nama
                    </th>
                    <th className="py-4 text-label-uppercase text-secondary font-normal uppercase">
                      Email
                    </th>
                    <th className="py-4 text-label-uppercase text-secondary font-normal uppercase">
                      Peran
                    </th>
                    <th className="py-4 text-label-uppercase text-secondary font-normal uppercase">
                      Terdaftar
                    </th>
                    <th className="py-4 text-label-uppercase text-secondary font-normal uppercase text-right">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="text-body-md">
                  {visibleAccounts.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-8 text-center text-secondary text-body-md"
                      >
                        Tidak ada akun yang cocok dengan filter ini.
                      </td>
                    </tr>
                  ) : (
                    pagedAccounts.map((account, i) => (
                      <tr
                        key={account.id}
                        className="border-b border-outline-variant hover:bg-surface-container-low transition-colors"
                      >
                        <td className="py-4 pr-4 text-secondary tabular-nums">
                          {(safePage - 1) * PAGE_SIZE + i + 1}
                        </td>
                        <td className="py-4 text-primary font-medium">
                          {account.name}
                        </td>
                        <td className="py-4 text-secondary">{account.email}</td>
                        <td className="py-4">
                          <span
                            className={`inline-block px-2 py-1 text-[10px] tracking-[0.15em] uppercase ${roleStyle[account.role]}`}
                          >
                            {roleLabel[account.role]}
                          </span>
                        </td>
                        <td className="py-4 text-secondary">
                          {dateFormatter.format(new Date(account.createdAt))}
                        </td>
                        <td className="py-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedId(account.id)}
                            className="px-3 py-2 text-label-uppercase uppercase border border-outline text-secondary hover:text-accent hover:border-accent transition-colors"
                          >
                            Detail
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {visibleAccounts.length > 0 && (
              <Pagination
                page={safePage}
                pageSize={PAGE_SIZE}
                total={visibleAccounts.length}
                onPageChange={setPage}
              />
            )}
          </section>

          {/* Modal detail akun — aktivitas + ubah role. key=id agar state form
              (pilihan role) fresh tiap ganti akun. */}
          <Modal
            open={selectedId !== null}
            onClose={() => setSelectedId(null)}
            title="ACCOUNT DETAIL"
          >
            {selectedId !== null && (
              <AccountDetail key={selectedId} accountId={selectedId} />
            )}
          </Modal>
        </div>
      )}
    </DashboardShell>
    </RoleGate>
  );
}

// --- Modal detail akun -----------------------------------------------------

const EDITABLE_ROLES: { value: EditableRole; label: string }[] = [
  { value: "client", label: "CLIENT" },
  { value: "talent", label: "TALENT" },
];

const jenisLabel: Record<"talent" | "kelas", string> = {
  talent: "TALENT",
  kelas: "CLASS",
};

// submitted / in_progress → "SUBMITTED" / "IN PROGRESS".
function fmtStatus(status: string): string {
  return status.replace(/_/g, " ").toUpperCase();
}

function AccountDetail({ accountId }: { accountId: string }) {
  const { data, isLoading, isError } = useGetAccountActivityQuery(accountId);
  const [updateRole, { isLoading: isSaving }] = useUpdateAccountRoleMutation();
  // Pilihan role yang belum disimpan; null = ikut role akun saat ini.
  const [choice, setChoice] = useState<EditableRole | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (isLoading || !data) {
    return (
      <p className="text-label-uppercase text-on-surface-variant uppercase">
        Memuat detail akun…
      </p>
    );
  }
  if (isError) {
    return (
      <p className="text-label-uppercase text-error uppercase">
        Gagal memuat detail akun.
      </p>
    );
  }

  const { account, applications, inquiries } = data;
  const isAdmin = account.role === "admin";
  const currentRole = isAdmin ? null : (account.role as EditableRole);
  const selected = choice ?? currentRole;
  const changed = selected !== null && selected !== currentRole;

  async function saveRole() {
    if (!selected || !changed) return;
    setError(null);
    try {
      await updateRole({ id: accountId, role: selected }).unwrap();
      // Setelah tersimpan, invalidasi memicu refetch → role akun terbaru jadi
      // acuan; reset pilihan lokal supaya tombol simpan kembali nonaktif.
      setChoice(null);
    } catch {
      setError("Gagal mengubah peran. Coba lagi.");
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-gutter gap-y-4">
        <Field label="Nama" value={account.name} />
        <Field label="Email" value={account.email} />
        <Field label="Peran saat ini" value={roleLabel[account.role]} />
        <Field
          label="Terdaftar"
          value={dateFormatter.format(new Date(account.createdAt))}
        />
      </dl>

      <section className="flex flex-col gap-3 border-t border-outline-variant pt-6">
        <h3 className="text-label-uppercase text-secondary uppercase">
          Ubah Role
        </h3>
        {isAdmin ? (
          <p className="text-body-md text-secondary">
            Peran admin tidak dapat diubah dari panel ini.
          </p>
        ) : (
          <>
            <div className="flex gap-2">
              {EDITABLE_ROLES.map((r) => {
                const active = selected === r.value;
                return (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setChoice(r.value)}
                    className={`px-4 py-2 text-label-uppercase uppercase border transition-colors ${
                      active
                        ? "bg-primary text-on-primary border-primary"
                        : "border-outline text-secondary hover:text-accent hover:border-accent"
                    }`}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>
            {error && (
              <p className="text-caption text-error uppercase tracking-[0.1em]">
                {error}
              </p>
            )}
            <button
              type="button"
              onClick={saveRole}
              disabled={!changed || isSaving}
              className="self-start px-6 py-3 text-label-uppercase uppercase border border-primary bg-primary text-on-primary hover:bg-accent hover:border-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? "Menyimpan…" : "Simpan Peran"}
            </button>
          </>
        )}
      </section>

      <ActivitySection title="Pendaftaran">
        {applications.length === 0 ? (
          <p className="text-body-md text-on-surface-variant">
            Belum ada pendaftaran.
          </p>
        ) : (
          applications.map((a) => (
            <ActivityRow
              key={a.id}
              primary={a.title}
              meta={`${jenisLabel[a.jenis]} · ${dateFormatter.format(new Date(a.createdAt))}`}
              status={fmtStatus(a.status)}
            />
          ))
        )}
      </ActivitySection>

      <ActivitySection title="Inquiry">
        {inquiries.length === 0 ? (
          <p className="text-body-md text-on-surface-variant">
            Belum ada inquiry.
          </p>
        ) : (
          inquiries.map((i) => (
            <ActivityRow
              key={i.id}
              primary={i.judulProject}
              meta={`INQUIRY · ${dateFormatter.format(new Date(i.createdAt))}`}
              status={fmtStatus(i.status)}
            />
          ))
        )}
      </ActivitySection>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-label-uppercase text-secondary uppercase mb-1">
        {label}
      </dt>
      <dd className="text-body-md text-primary break-words">{value}</dd>
    </div>
  );
}

function ActivitySection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3 border-t border-outline-variant pt-6">
      <h3 className="text-label-uppercase text-secondary uppercase">{title}</h3>
      <div className="flex flex-col">{children}</div>
    </section>
  );
}

function ActivityRow({
  primary,
  meta,
  status,
}: {
  primary: string;
  meta: string;
  status: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-outline-variant last:border-b-0">
      <div className="min-w-0">
        <p className="text-body-md text-primary font-medium truncate">
          {primary}
        </p>
        <p className="text-caption text-on-surface-variant uppercase tracking-[0.1em]">
          {meta}
        </p>
      </div>
      <span className="shrink-0 text-label-uppercase uppercase text-secondary border border-outline-variant px-2 py-1">
        {status}
      </span>
    </div>
  );
}
