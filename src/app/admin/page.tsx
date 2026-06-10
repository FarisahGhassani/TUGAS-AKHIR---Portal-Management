"use client";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { AnnouncementForm } from "@/components/admin/AnnouncementForm";
import { adminFooterItems, adminSections } from "@/components/admin/adminNav";
import {
  useGetAdminOverviewQuery,
  type ApplicationStatus,
} from "@/store/api/adminApi";

const statusStyle: Record<ApplicationStatus, string> = {
  new: "bg-surface-variant text-primary",
  under_review: "bg-surface-container-highest text-secondary",
  approved: "bg-primary text-on-primary",
  declined: "bg-error-container text-on-error-container",
};

const statusLabel: Record<ApplicationStatus, string> = {
  new: "NEW",
  under_review: "UNDER REVIEW",
  approved: "APPROVED",
  declined: "DECLINED",
};

export default function AdminOverviewPage() {
  const { data, isLoading, isError } = useGetAdminOverviewQuery();

  return (
    <DashboardShell
      sections={adminSections}
      footerItems={adminFooterItems}
      brandHref="/admin"
    >
      {isLoading || !data ? (
        <p className="text-label-uppercase text-on-surface-variant uppercase">
          Loading admin overview…
        </p>
      ) : isError ? (
        <p className="text-label-uppercase text-error uppercase">
          Failed to load admin overview.
        </p>
      ) : (
        <div className="flex flex-col gap-section">
          <header>
            <h1 className="font-display text-headline-lg-mobile md:text-headline-lg text-primary mb-2 uppercase">
              ADMIN OVERVIEW
            </h1>
            <p className="text-body-lg text-secondary">
              Manage talent, inquiries, and modelling class
            </p>
          </header>

          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
            <MetricCard
              label="Total Active Talent"
              value={data.metrics.activeTalent}
            />
            <MetricCard
              label="Pending Applications"
              value={data.metrics.pendingApplications}
            />
            <MetricCard label="New Inquiries" value={data.metrics.newInquiries} />
            <MetricCard
              label="Active Class Batches"
              value={data.metrics.activeClassBatches}
            />
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
            <section className="lg:col-span-8 flex flex-col gap-6">
              <div className="flex justify-between items-end border-b border-outline-variant pb-4">
                <h2 className="font-display text-headline-md text-primary uppercase">
                  RECENT TALENT APPLICATIONS
                </h2>
                <a
                  href="/admin/talent"
                  className="text-label-uppercase text-secondary hover:text-primary transition-colors uppercase"
                >
                  View All
                </a>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[640px]">
                  <thead>
                    <tr className="border-b border-outline-variant">
                      <th className="py-4 text-label-uppercase text-secondary font-normal uppercase">
                        Name
                      </th>
                      <th className="py-4 text-label-uppercase text-secondary font-normal uppercase">
                        Date Applied
                      </th>
                      <th className="py-4 text-label-uppercase text-secondary font-normal uppercase">
                        Category
                      </th>
                      <th className="py-4 text-label-uppercase text-secondary font-normal uppercase">
                        Status
                      </th>
                      <th className="py-4 text-right text-label-uppercase text-secondary font-normal uppercase">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-body-md">
                    {data.applications.map((application) => (
                      <tr
                        key={application.id}
                        className="border-b border-outline-variant hover:bg-surface-container-low transition-colors"
                      >
                        <td className="py-4 text-primary font-medium">
                          {application.name}
                        </td>
                        <td className="py-4 text-secondary">
                          {application.appliedAt}
                        </td>
                        <td className="py-4 text-secondary">
                          {application.category}
                        </td>
                        <td className="py-4">
                          <span
                            className={`inline-block px-2 py-1 text-[10px] tracking-[0.15em] uppercase ${statusStyle[application.status]}`}
                          >
                            {statusLabel[application.status]}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <button
                            type="button"
                            className="text-label-uppercase text-primary hover:opacity-70 transition-opacity uppercase"
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="lg:col-span-4 flex flex-col gap-6">
              <div className="flex justify-between items-end border-b border-outline-variant pb-4">
                <h2 className="font-display text-headline-md text-primary uppercase">
                  CLIENT INQUIRIES
                </h2>
              </div>
              <div className="flex flex-col gap-4">
                {data.inquiries.map((inquiry) => (
                  <article
                    key={inquiry.id}
                    className="p-4 border border-outline-variant bg-surface flex flex-col gap-2"
                  >
                    <div className="flex justify-between items-baseline">
                      <span className="text-label-uppercase text-primary uppercase">
                        {inquiry.client}
                      </span>
                      <span className="text-caption text-secondary">
                        {inquiry.receivedAgo}
                      </span>
                    </div>
                    <p className="text-body-md text-secondary line-clamp-2">
                      {inquiry.excerpt}
                    </p>
                  </article>
                ))}
              </div>
              <button
                type="button"
                className="w-full py-4 border border-primary text-primary text-label-uppercase hover:bg-primary hover:text-on-primary transition-colors uppercase"
              >
                View All Inquiries
              </button>
            </section>
          </div>

          <AnnouncementForm />
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
      <span className="font-display text-headline-md text-primary">
        {value}
      </span>
    </div>
  );
}
