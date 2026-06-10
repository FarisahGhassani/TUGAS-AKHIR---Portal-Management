import { http, HttpResponse, delay } from "msw";
import { landingContent } from "./data/landing";
import { findTalentBySlug, listTalents } from "./data/talents";
import { dashboardSummary } from "./data/dashboard";
import { listActiveAnnouncements } from "./data/announcements";
import { agencyInfo } from "./data/agency";
import { addInquiry, listInquiries } from "./data/inquiries";
import type { AnnouncementDraft } from "@/store/api/adminApi";
import type { CreateInquiryRequest } from "@/store/api/inquiryApi";

// NOTE: auth (login, register, forgot-password, reset-password) and the admin
// account/overview reads are now handled by REAL Next.js Route Handlers under
// src/app/api/** so the password-reset flow has a server-side source of truth.
// MSW is configured with `onUnhandledRequest: "bypass"`, so the requests below
// that are NOT listed here fall through to those Route Handlers.

export const handlers = [
  http.get("/api/landing", () => {
    return HttpResponse.json(landingContent);
  }),

  http.get("/api/agency", async () => {
    await delay(150);
    return HttpResponse.json(agencyInfo);
  }),

  http.get("/api/announcements", async ({ request }) => {
    await delay(250);
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const data =
      status === "aktif" ? listActiveAnnouncements() : listActiveAnnouncements();
    return HttpResponse.json(data);
  }),

  http.get("/api/talents", async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const result = listTalents({
      search: url.searchParams.get("search") ?? undefined,
      division: url.searchParams.get("division") ?? undefined,
      gender: url.searchParams.get("gender") ?? undefined,
      category: url.searchParams.get("category") ?? undefined,
      minHeightCm: url.searchParams.get("minHeightCm")
        ? Number(url.searchParams.get("minHeightCm"))
        : undefined,
    });
    const summaries = result.map((t) => ({
      id: t.id,
      slug: t.slug,
      name: t.name,
      division: t.division,
      gender: t.gender,
      heightCm: t.heightCm,
      heightLabel: t.heightLabel,
      cover: t.cover,
      coverAlt: t.coverAlt,
      thumbAspect: t.thumbAspect,
    }));
    return HttpResponse.json(summaries);
  }),

  http.get("/api/talents/:slug", async ({ params }) => {
    await delay(250);
    const talent = findTalentBySlug(String(params.slug));
    if (!talent) {
      return HttpResponse.json({ message: "Talent not found." }, { status: 404 });
    }
    return HttpResponse.json(talent);
  }),

  http.get("/api/dashboard", async () => {
    await delay(300);
    return HttpResponse.json(dashboardSummary);
  }),

  // Client collaboration — riwayat inquiry untuk dipantau.
  http.get("/api/inquiries", async () => {
    await delay(300);
    return HttpResponse.json(listInquiries());
  }),

  // Client collaboration — mengajukan project brief baru.
  http.post("/api/inquiries", async ({ request }) => {
    await delay(450);
    const body = (await request.json()) as CreateInquiryRequest;
    if (
      !body.namaClient?.trim() ||
      !body.noTelepon?.trim() ||
      !body.judulProject?.trim() ||
      !body.jenisJob?.trim()
    ) {
      return HttpResponse.json(
        {
          message:
            "Nama, nomor telepon, judul project, dan jenis job wajib diisi.",
        },
        { status: 422 },
      );
    }
    const created = addInquiry({
      namaClient: body.namaClient.trim(),
      noTelepon: body.noTelepon.trim(),
      judulProject: body.judulProject.trim(),
      brand: body.brand?.trim() || undefined,
      jenisJob: body.jenisJob.trim(),
      tanggalProject: body.tanggalProject || undefined,
      modelPilihan: body.modelPilihan?.trim() || undefined,
      catatanClient: body.catatanClient?.trim() || undefined,
    });
    return HttpResponse.json(created, { status: 201 });
  }),

  http.post("/api/admin/announcements", async ({ request }) => {
    await delay(400);
    const body = (await request.json()) as AnnouncementDraft;
    if (!body.headline.trim() || !body.message.trim()) {
      return HttpResponse.json(
        { message: "Headline and message are required." },
        { status: 422 },
      );
    }
    return HttpResponse.json(
      {
        id: `ann-${Date.now()}`,
        headline: body.headline,
        message: body.message,
        publishedAt: body.publish ? new Date().toISOString() : null,
      },
      { status: 201 },
    );
  }),
];
