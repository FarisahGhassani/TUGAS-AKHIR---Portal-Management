"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { adminFooterItems, adminSections } from "@/components/admin/adminNav";
import { RoleGate } from "@/components/auth/RoleGate";
import { FileField, type PickedFile } from "@/components/dashboard/FileField";
import { useAppSelector } from "@/store/hooks";
import {
  useGetSiteAssetsQuery,
  useUpdateSiteAssetMutation,
  type SiteAssetKey,
} from "@/store/api/siteAssetsApi";
import {
  useGetLandingQuery,
  useUpdateLandingMutation,
  type LandingContent,
} from "@/store/api/landingApi";

const inputClass =
  "w-full border-0 border-b border-outline bg-transparent px-0 py-2 focus:outline-none focus:border-primary text-body-md text-primary placeholder:text-outline-variant transition-colors";
const areaClass =
  "w-full border border-outline-variant bg-transparent p-3 focus:outline-none focus:border-primary text-body-md text-primary placeholder:text-outline-variant resize-none";
const labelClass = "text-label-uppercase text-secondary block uppercase mb-2";

// Satu submenu "SITE & LANDING": aset media (hero video, gambar essence/auth)
// + teks landing (essence/capabilities/cta). Keduanya tetap lewat RTK.
export default function AdminSitePage() {
  return (
    <RoleGate allow="admin">
      <DashboardShell
        sections={adminSections}
        footerItems={adminFooterItems}
        brandHref="/admin"
      >
        <div className="flex flex-col gap-10 max-w-3xl">
          <header>
            <p className="text-label-uppercase text-secondary uppercase mb-2">
              AGENCY · SITE & LANDING
            </p>
            <h1
              className="font-display text-primary uppercase leading-[0.9] tracking-[-0.03em] font-bold"
              style={{ fontSize: "clamp(32px, 5vw, 56px)" }}
            >
              SITE & LANDING
            </h1>
            <p className="text-body-md text-secondary max-w-prose mt-3">
              Aset media (hero video, gambar) dan teks halaman utama. Aset
              kosong / teks tak diubah akan memakai default bawaan.
            </p>
          </header>

          <AssetsSection />
          <LandingSection />
        </div>
      </DashboardShell>
    </RoleGate>
  );
}

/* ----------------------------- Assets ---------------------------------- */

function AssetsSection() {
  const isAdmin = useAppSelector((s) => s.auth.user?.role === "admin");
  const { data, isLoading, isError } = useGetSiteAssetsQuery(undefined, {
    skip: !isAdmin,
  });

  return (
    <section className="flex flex-col gap-5">
      <h2 className="font-display text-headline-md text-primary uppercase border-b border-outline-variant pb-3">
        Media Assets
      </h2>
      {isLoading || !data ? (
        <p className="text-caption text-secondary uppercase tracking-[0.1em]">
          Memuat aset…
        </p>
      ) : isError ? (
        <p className="text-label-uppercase text-error uppercase">
          Gagal memuat aset.
        </p>
      ) : (
        <>
          <AssetEditor
            assetKey="hero_video"
            label="Hero — Main Video"
            hint="URL video (mis. /videos/portal-asset.mp4 atau link .mp4). Tampil di bawah hero."
            kind="video"
            current={data.heroVideo}
          />
          <AssetEditor
            assetKey="essence_image"
            label="Landing — Essence Image"
            hint="Gambar portrait di section Essence (About)."
            kind="image"
            current={data.essenceImage}
          />
          <AssetEditor
            assetKey="auth_image"
            label="Auth Page — Image"
            hint="Gambar besar di halaman login/registrasi."
            kind="image"
            current={data.authImage}
          />
        </>
      )}
    </section>
  );
}

function AssetEditor({
  assetKey,
  label,
  hint,
  kind,
  current,
}: {
  assetKey: SiteAssetKey;
  label: string;
  hint: string;
  kind: "video" | "image";
  current: string;
}) {
  const [update, { isLoading }] = useUpdateSiteAssetMutation();
  const [value, setValue] = useState(current);
  const [feedback, setFeedback] = useState<{
    tone: "success" | "error";
    text: string;
  } | null>(null);

  async function save() {
    setFeedback(null);
    try {
      await update({ key: assetKey, value: value.trim() }).unwrap();
      setFeedback({ tone: "success", text: "Tersimpan." });
    } catch {
      setFeedback({ tone: "error", text: "Gagal menyimpan." });
    }
  }

  function onUpload(file: PickedFile | null) {
    if (file?.dataUrl) setValue(file.dataUrl);
  }

  const isData = value.startsWith("data:");

  return (
    <div className="border border-outline-variant p-5 md:p-6 bg-surface flex flex-col gap-4">
      <div>
        <h3 className="font-display text-headline-md text-primary uppercase">
          {label}
        </h3>
        <p className="text-caption text-secondary tracking-[0.06em] mt-1">
          {hint}
        </p>
      </div>

      {value ? (
        kind === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt={label}
            className="h-40 w-auto max-w-full object-cover border border-outline-variant"
          />
        ) : isData ? (
          <video
            src={value}
            controls
            className="h-40 w-auto max-w-full border border-outline-variant bg-primary"
          />
        ) : (
          <p className="text-caption text-on-surface-variant font-mono break-all">
            {value}
          </p>
        )
      ) : (
        <p className="text-caption text-on-surface-variant uppercase tracking-[0.1em]">
          (memakai default)
        </p>
      )}

      <div>
        <label className={labelClass}>
          {kind === "video" ? "URL Video" : "URL Gambar"}
        </label>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={
            kind === "video" ? "/videos/…  atau  https://….mp4" : "https://…"
          }
          className={inputClass}
        />
      </div>

      {kind === "image" && (
        <FileField
          label="…atau unggah gambar"
          accept="image/*"
          value={null}
          onChange={onUpload}
        />
      )}

      <div className="flex items-center justify-between gap-4">
        {feedback ? (
          <p
            className={`text-caption uppercase tracking-[0.1em] ${
              feedback.tone === "success" ? "text-primary" : "text-error"
            }`}
          >
            {feedback.text}
          </p>
        ) : (
          <span />
        )}
        <div className="flex gap-3">
          {value && (
            <button
              type="button"
              onClick={() => setValue("")}
              className="px-5 py-2.5 border border-outline text-secondary text-label-uppercase hover:text-error hover:border-error transition-colors uppercase"
            >
              Kosongkan
            </button>
          )}
          <button
            type="button"
            onClick={save}
            disabled={isLoading}
            className="px-6 py-2.5 bg-primary text-on-primary text-label-uppercase hover:bg-accent transition-colors uppercase disabled:opacity-50"
          >
            {isLoading ? "MENYIMPAN…" : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- Landing --------------------------------- */

function LandingSection() {
  const isAdmin = useAppSelector((s) => s.auth.user?.role === "admin");
  const { data, isLoading, isError } = useGetLandingQuery(undefined, {
    skip: !isAdmin,
  });

  return (
    <section className="flex flex-col gap-5">
      <h2 className="font-display text-headline-md text-primary uppercase border-b border-outline-variant pb-3">
        Landing Text
      </h2>
      {isLoading || !data ? (
        <p className="text-caption text-secondary uppercase tracking-[0.1em]">
          Memuat konten landing…
        </p>
      ) : isError ? (
        <p className="text-label-uppercase text-error uppercase">
          Gagal memuat konten landing.
        </p>
      ) : (
        <LandingEditor initial={data} />
      )}
    </section>
  );
}

function LandingEditor({ initial }: { initial: LandingContent }) {
  const [update, { isLoading }] = useUpdateLandingMutation();

  const [essEyebrow, setEssEyebrow] = useState(initial.essence.eyebrow);
  const [essBody, setEssBody] = useState(initial.essence.body);
  const [essCta, setEssCta] = useState(initial.essence.ctaLabel);

  const [capEyebrow, setCapEyebrow] = useState(initial.capabilities.eyebrow);
  const [items, setItems] = useState(initial.capabilities.items);

  const [ctaTitle, setCtaTitle] = useState(initial.cta.title);
  const [ctaBody, setCtaBody] = useState(initial.cta.body);
  const [ctaButton, setCtaButton] = useState(initial.cta.buttonLabel);

  const [feedback, setFeedback] = useState<{
    tone: "success" | "error";
    text: string;
  } | null>(null);

  function updateItem(i: number, patch: Partial<(typeof items)[number]>) {
    setItems((prev) =>
      prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)),
    );
  }

  async function save() {
    setFeedback(null);
    try {
      await update({
        essence: {
          ...initial.essence,
          eyebrow: essEyebrow.trim(),
          body: essBody.trim(),
          ctaLabel: essCta.trim(),
        },
        capabilities: {
          eyebrow: capEyebrow.trim(),
          items: items
            .filter((it) => it.title.trim())
            .map((it) => ({
              title: it.title.trim(),
              description: it.description.trim(),
            })),
        },
        cta: {
          title: ctaTitle.trim(),
          body: ctaBody.trim(),
          buttonLabel: ctaButton.trim(),
        },
      }).unwrap();
      setFeedback({ tone: "success", text: "Konten landing tersimpan." });
    } catch {
      setFeedback({ tone: "error", text: "Gagal menyimpan." });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Essence */}
      <div className="border border-outline-variant p-5 md:p-6 bg-surface flex flex-col gap-4">
        <h3 className="font-display text-headline-md text-primary uppercase">
          Essence (About)
        </h3>
        <div>
          <label className={labelClass}>Eyebrow</label>
          <input
            className={inputClass}
            value={essEyebrow}
            onChange={(e) => setEssEyebrow(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Body</label>
          <textarea
            className={areaClass}
            rows={4}
            value={essBody}
            onChange={(e) => setEssBody(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Label CTA</label>
          <input
            className={inputClass}
            value={essCta}
            onChange={(e) => setEssCta(e.target.value)}
          />
        </div>
      </div>

      {/* Capabilities */}
      <div className="border border-outline-variant p-5 md:p-6 bg-surface flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-headline-md text-primary uppercase">
            Capabilities
          </h3>
          <button
            type="button"
            onClick={() =>
              setItems((prev) => [...prev, { title: "", description: "" }])
            }
            className="text-label-uppercase text-primary hover:text-accent transition-colors uppercase"
          >
            + Tambah
          </button>
        </div>
        <div>
          <label className={labelClass}>Eyebrow</label>
          <input
            className={inputClass}
            value={capEyebrow}
            onChange={(e) => setCapEyebrow(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-4">
          {items.map((it, i) => (
            <div
              key={i}
              className="border border-outline-variant p-4 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-caption text-secondary uppercase tracking-[0.1em]">
                  Item {i + 1}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setItems((prev) => prev.filter((_, idx) => idx !== i))
                  }
                  className="text-label-uppercase text-secondary hover:text-error transition-colors uppercase"
                >
                  Hapus
                </button>
              </div>
              <input
                className={inputClass}
                placeholder="Judul"
                value={it.title}
                onChange={(e) => updateItem(i, { title: e.target.value })}
              />
              <textarea
                className={areaClass}
                rows={2}
                placeholder="Deskripsi"
                value={it.description}
                onChange={(e) => updateItem(i, { description: e.target.value })}
              />
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="border border-outline-variant p-5 md:p-6 bg-surface flex flex-col gap-4">
        <h3 className="font-display text-headline-md text-primary uppercase">
          CTA
        </h3>
        <div>
          <label className={labelClass}>Judul</label>
          <input
            className={inputClass}
            value={ctaTitle}
            onChange={(e) => setCtaTitle(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Body</label>
          <textarea
            className={areaClass}
            rows={3}
            value={ctaBody}
            onChange={(e) => setCtaBody(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Label Tombol</label>
          <input
            className={inputClass}
            value={ctaButton}
            onChange={(e) => setCtaButton(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-4">
        {feedback && (
          <p
            className={`text-caption uppercase tracking-[0.1em] ${
              feedback.tone === "success" ? "text-primary" : "text-error"
            }`}
          >
            {feedback.text}
          </p>
        )}
        <button
          type="button"
          onClick={save}
          disabled={isLoading}
          className="px-6 py-3 bg-primary text-on-primary text-label-uppercase hover:bg-accent transition-colors uppercase disabled:opacity-50"
        >
          {isLoading ? "MENYIMPAN…" : "Simpan Teks Landing"}
        </button>
      </div>
    </div>
  );
}
