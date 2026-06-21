"use client";

import { useMemo, useState } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Pagination } from "@/components/Pagination";
import { adminFooterItems, adminSections } from "@/components/admin/adminNav";
import { RoleGate } from "@/components/auth/RoleGate";
import { useAppSelector } from "@/store/hooks";
import { useGetAccountsQuery } from "@/store/api/adminApi";
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

          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
            <MetricCard label="Total Akun" value={data.accounts.length} />
            <MetricCard label="Admin" value={data.totals.admin} />
            <MetricCard label="Talent" value={data.totals.talent} />
            <MetricCard label="Client" value={data.totals.client} />
          </section>

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
                    <th className="py-4 text-label-uppercase text-secondary font-normal uppercase">
                      ID Akun
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
                        <td className="py-4 text-caption text-on-surface-variant font-mono">
                          {account.id}
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
        </div>
      )}
    </DashboardShell>
    </RoleGate>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-surface p-6 border border-outline-variant flex flex-col gap-4">
      <span className="text-label-uppercase text-secondary uppercase">
        {label}
      </span>
      <span className="font-display text-headline-md text-primary">{value}</span>
    </div>
  );
}
