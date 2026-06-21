import { http, HttpResponse, delay } from "msw";
import { landingContent } from "./data/landing";
import { findTalentBySlug, listTalents } from "./data/talents";
import { listProjects } from "./data/projects";
import {
  dashboardSummary,
  addApplication,
  listBatches,
  findBatch,
} from "./data/dashboard";
import { agencyInfo } from "./data/agency";
import { addInquiry, listInquiries } from "./data/inquiries";
import type { CreateInquiryRequest } from "@/store/api/inquiryApi";
import type { CreateApplicationRequest } from "@/store/api/dashboardApi";

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

  // NOTE: /api/announcements (+ /api/admin/announcements CRUD) kini ditangani
  // REAL Next.js Route Handlers (src/app/api/**) yang menulis ke server store,
  // supaya pengumuman yang dibuat admin persist & langsung tampil di landing.
  // MSW di-bypass untuk path itu.

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

  http.get("/api/projects", async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const result = listProjects({
      search: url.searchParams.get("search") ?? undefined,
      type: url.searchParams.get("type") ?? undefined,
    });
    return HttpResponse.json(result);
  }),

  http.get("/api/dashboard", async () => {
    await delay(300);
    return HttpResponse.json(dashboardSummary);
  }),

  // Daftar batch kelas yang tersedia (untuk form modelling school).
  http.get("/api/batches", async () => {
    await delay(200);
    return HttpResponse.json(listBatches());
  }),

  // Dua form berbeda (talent / kelas) → satu store pendaftaran, dibedakan
  // kolom `jenis`. Validasi field mengikuti PRD per jenis.
  http.post("/api/dashboard/applications", async ({ request }) => {
    await delay(450);
    const body = (await request.json()) as CreateApplicationRequest;

    if (body.jenis === "talent") {
      const required =
        body.namaTalent?.trim() &&
        body.tanggalLahir &&
        body.tinggiBadan &&
        body.beratBadan &&
        body.sizeBaju?.trim() &&
        body.sizeSepatu?.trim() &&
        body.kartuIdentitas?.trim() &&
        body.noTelepon?.trim() &&
        body.fotoProfil?.trim();
      if (!required) {
        return HttpResponse.json(
          { message: "Please complete all required talent fields." },
          { status: 422 },
        );
      }
      const created = addApplication({
        jenis: "talent",
        judul: "TALENT APPLICATION",
      });
      return HttpResponse.json(created, { status: 201 });
    }

    if (body.jenis === "kelas") {
      const batch = findBatch(body.batchId);
      if (!batch || !body.noTelepon?.trim() || !body.buktiPembayaran?.trim()) {
        return HttpResponse.json(
          {
            message:
              "Select a batch and upload your payment proof to register.",
          },
          { status: 422 },
        );
      }
      const created = addApplication({
        jenis: "kelas",
        judul: `KELAS BATCH ${String(batch.batchKe).padStart(2, "0")} · ${batch.namaBatch.toUpperCase()}`,
      });
      return HttpResponse.json(created, { status: 201 });
    }

    return HttpResponse.json(
      { message: "Unknown application type." },
      { status: 422 },
    );
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
            "Phone number, project title, and job type are required.",
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
];
