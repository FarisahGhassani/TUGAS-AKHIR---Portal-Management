"use client";

import { useMemo, useState } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { adminFooterItems, adminSections } from "@/components/admin/adminNav";
import { useGetAccountsQuery } from "@/store/api/adminApi";
import type { AuthRole } from "@/store/api/authApi";

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
  { label: "ALL", value: "all" },
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
  const { data, isLoading, isError, isFetching } = useGetAccountsQuery();
  const [filter, setFilter] = useState<"all" | AuthRole>("all");

  const visibleAccounts = useMemo(() => {
    if (!data) return [];
    return filter === "all"
      ? data.accounts
      : data.accounts.filter((a) => a.role === filter);
  }, [data, filter]);

  return (
    <DashboardShell
      sections={adminSections}
      footerItems={adminFooterItems}
      brandHref="/admin"
    >
      {isLoading || !data ? (
        <p className="text-label-uppercase text-on-surface-variant uppercase">
          Loading accounts…
        </p>
      ) : isError ? (
        <p className="text-label-uppercase text-error uppercase">
          Failed to load accounts.
        </p>
      ) : (
        <div className="flex flex-col gap-section">
          <header className="flex flex-col gap-2">
            <h1 className="font-display text-headline-lg-mobile md:text-headline-lg text-primary uppercase">
              REGISTERED ACCOUNTS
            </h1>
            <p className="text-body-lg text-secondary">
              Every account that has signed up to the portal — including the
              role each one logged in as.
            </p>
          </header>

          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
            <MetricCard
              label="Total Accounts"
              value={data.accounts.length}
            />
            <MetricCard label="Admins" value={data.totals.admin} />
            <MetricCard label="Talents" value={data.totals.talent} />
            <MetricCard label="Clients" value={data.totals.client} />
          </section>

          <section className="flex flex-col gap-6">
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
                      onClick={() => setFilter(f.value)}
                      className={`px-3 py-2 text-label-uppercase uppercase transition-colors border ${
                        active
                          ? "bg-primary text-on-primary border-primary"
                          : "border-outline text-secondary hover:text-primary"
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
                Refreshing…
              </p>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[720px]">
                <thead>
                  <tr className="border-b border-outline-variant">
                    <th className="py-4 text-label-uppercase text-secondary font-normal uppercase">
                      Name
                    </th>
                    <th className="py-4 text-label-uppercase text-secondary font-normal uppercase">
                      Email
                    </th>
                    <th className="py-4 text-label-uppercase text-secondary font-normal uppercase">
                      Role
                    </th>
                    <th className="py-4 text-label-uppercase text-secondary font-normal uppercase">
                      Registered
                    </th>
                    <th className="py-4 text-label-uppercase text-secondary font-normal uppercase">
                      Account ID
                    </th>
                  </tr>
                </thead>
                <tbody className="text-body-md">
                  {visibleAccounts.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-8 text-center text-secondary text-body-md"
                      >
                        No accounts match this filter.
                      </td>
                    </tr>
                  ) : (
                    visibleAccounts.map((account) => (
                      <tr
                        key={account.id}
                        className="border-b border-outline-variant hover:bg-surface-container-low transition-colors"
                      >
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
          </section>
        </div>
      )}
    </DashboardShell>
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
