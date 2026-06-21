import type {
  OverviewData,
  ClientInquiry,
  TalentApplication,
} from "@/store/api/adminApi";

export const adminOverview: OverviewData = {
  metrics: {
    activeTalent: 142,
    pendingApplications: 28,
    newInquiries: 15,
    activeClassBatches: 6,
  },
  applications: [
    {
      id: "a-elena-rostova",
      name: "Elena Rostova",
      appliedAt: "Oct 24, 2024",
      category: "Editorial",
      status: "new",
    },
    {
      id: "a-marcus-chen",
      name: "Marcus Chen",
      appliedAt: "Oct 22, 2024",
      category: "Commercial",
      status: "under_review",
    },
    {
      id: "a-sarah-jenkins",
      name: "Sarah Jenkins",
      appliedAt: "Oct 20, 2024",
      category: "Runway",
      status: "new",
    },
    {
      id: "a-leo-martinez",
      name: "Leo Martinez",
      appliedAt: "Oct 18, 2024",
      category: "Editorial",
      status: "approved",
    },
  ],
  inquiries: [
    {
      id: "ci-vogue-paris",
      client: "VOGUE PARIS",
      receivedAgo: "2h ago",
      excerpt:
        "Inquiry for editorial shoot featuring 3 runway models for spring collection.",
    },
    {
      id: "ci-chanel",
      client: "CHANEL",
      receivedAgo: "1d ago",
      excerpt:
        "Campaign casting call. Requesting portfolios for upcoming global campaign.",
    },
    {
      id: "ci-arno",
      client: "MAISON ARNO",
      receivedAgo: "3d ago",
      excerpt:
        "Looking for two main board talents for the Resort 25 lookbook in Marrakech.",
    },
  ],
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  year: "numeric",
});

export function addTalentApplication(input: {
  id: string;
  name: string;
}): TalentApplication {
  const application: TalentApplication = {
    id: input.id,
    name: input.name,
    appliedAt: dateFormatter.format(new Date()),
    category: "Pending Review",
    status: "new",
  };
  adminOverview.applications.unshift(application);
  adminOverview.metrics.pendingApplications += 1;
  return application;
}

export function addClientInquiry(input: {
  id: string;
  name: string;
}): ClientInquiry {
  const inquiry: ClientInquiry = {
    id: input.id,
    client: input.name.toUpperCase(),
    receivedAgo: "Just now",
    excerpt: `New client account registered by ${input.name}. Awaiting brief details.`,
  };
  adminOverview.inquiries.unshift(inquiry);
  adminOverview.metrics.newInquiries += 1;
  return inquiry;
}
