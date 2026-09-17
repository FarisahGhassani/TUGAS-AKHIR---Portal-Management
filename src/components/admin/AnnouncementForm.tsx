"use client";

import { useState } from "react";
import { FileField, type PickedFile } from "@/components/dashboard/FileField";
import { ketikKapital } from "@/lib/teksPublik";
import {
  useCreateAnnouncementMutation,
  useUpdateAnnouncementMutation,
  type Announcement,
  type AnnouncementStatus,
} from "@/store/api/announcementsApi";

const inputClass =
  "w-full border-0 border-b border-outline bg-transparent px-0 py-2 focus:outline-none focus:border-primary text-body-md text-primary placeholder:text-outline-variant transition-colors";
const labelClass = "text-label-uppercase text-secondary block uppercase mb-1.5";
const selectClass = `${inputClass} appearance-none rounded-none cursor-pointer pr-8`;

// Tujuan CTA pengumuman. Pendaftaran talent/kelas tidak punya halaman publik
// khusus (dilakukan setelah login di dashboard), jadi CTA "daftar" mengarah ke
// gerbang /auth. Opsi "custom" untuk URL bebas (mis. tautan eksternal).
const CUSTOM_LINK = "__custom__";
const LINK_PRESETS: { value: string; label: string }[] = [
  { value: "/auth", label: "PENDAFTARAN / LOGIN (/auth)" },
  { value: "/talent", label: "KATALOG TALENT (/talent)" },
  { value: "/projects", label: "PROJECTS (/projects)" },
  { value: "/", label: "BERANDA / LANDING (/)" },
  { value: CUSTOM_LINK, label: "URL KUSTOM (tautan eksternal)…" },
];
const isPreset = (link: string) =>
  LINK_PRESETS.some((p) => p.value !== CUSTOM_LINK && p.value === link);

/**
 * Form create/edit pengumuman. Field mengikuti model Announcement yang dibaca
 * landing page. State di-init lazy dari `editing`; pemanggil memberi `key` agar
 * komponen remount saat ganti target (tanpa sinkronisasi via useEffect). Semua
 * I/O lewat RTK mutation.
 */
export function AnnouncementForm({
  editing,
  onDone,
}: {
  editing?: Announcement | null;
  onDone?: () => void;
}) {
  const [createAnnouncement, { isLoading: creating }] =
    useCreateAnnouncementMutation();
  const [updateAnnouncement, { isLoading: updating }] =
    useUpdateAnnouncementMutation();
  const isLoading = creating || updating;
  const isEdit = Boolean(editing);

  const [judul, setJudul] = useState(editing?.judul ?? "");
  const [ringkasan, setRingkasan] = useState(editing?.ringkasan ?? "");
  const [tanggalBerakhir, setTanggalBerakhir] = useState(
    editing?.tanggalBerakhir ?? "",
  );
  const [link, setLink] = useState(editing?.link ?? "/auth");
  // Mode dropdown: preset (salah satu halaman internal) atau URL kustom bebas.
  const [linkMode, setLinkMode] = useState<"preset" | "custom">(
    editing && !isPreset(editing.link) ? "custom" : "preset",
  );
  const [status, setStatus] = useState<AnnouncementStatus>(
    editing?.status ?? "aktif",
  );
  const [poster, setPoster] = useState<PickedFile | null>(
    editing
      ? { name: "current-poster", type: "image/*", dataUrl: editing.fotoPoster }
      : null,
  );

  const [feedback, setFeedback] = useState<{
    tone: "success" | "error";
    text: string;
  } | null>(null);

  function resetFields() {
    setJudul("");
    setRingkasan("");
    setTanggalBerakhir("");
    setLink("/auth");
    setLinkMode("preset");
    setStatus("aktif");
    setPoster(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    if (!judul.trim())
      return setFeedback({ tone: "error", text: "Judul wajib diisi." });
    if (!ringkasan.trim())
      return setFeedback({ tone: "error", text: "Ringkasan wajib diisi." });
    if (!tanggalBerakhir)
      return setFeedback({ tone: "error", text: "Tanggal tenggat wajib diisi." });
    if (!poster?.dataUrl)
      return setFeedback({ tone: "error", text: "Silakan unggah gambar poster." });
    if (linkMode === "custom" && !link.trim())
      return setFeedback({ tone: "error", text: "URL tujuan wajib diisi." });

    const payload = {
      judul: judul.trim(),
      ringkasan: ringkasan.trim(),
      fotoPoster: poster.dataUrl,
      link: link.trim() || "/auth",
      tanggalBerakhir,
      status,
    };

    try {
      if (editing) {
        await updateAnnouncement({ id: editing.id, ...payload }).unwrap();
        setFeedback({
          tone: "success",
          text: `Perubahan "${payload.judul}" tersimpan.`,
        });
      } else {
        await createAnnouncement(payload).unwrap();
        setFeedback({
          tone: "success",
          text: `"${payload.judul}" berhasil diterbitkan.`,
        });
        resetFields();
      }
      onDone?.();
    } catch (err) {
      const text =
        err && typeof err === "object" && "data" in err
          ? ((err as { data?: { message?: string } }).data?.message ??
            "Gagal menyimpan pengumuman.")
          : "Gagal menyimpan pengumuman.";
      setFeedback({ tone: "error", text });
    }
  }

  return (
    <section className="border border-outline-variant p-5 md:p-6 bg-surface">
      <div className="flex items-center justify-between gap-4 mb-4">
        <h2 className="font-display text-headline-md text-primary uppercase">
          {isEdit ? "EDIT ANNOUNCEMENT" : "CREATE ANNOUNCEMENT"}
        </h2>
        {isEdit && (
          <button
            type="button"
            onClick={onDone}
            className="text-label-uppercase text-secondary hover:text-accent transition-colors uppercase"
          >
            Batal edit
          </button>
        )}
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="a-judul" className={labelClass}>
              Judul
            </label>
            <input
              id="a-judul"
              type="text"
              value={judul}
              // Judul tampil di landing → dikapitalkan otomatis biar seragam.
              onChange={(e) => setJudul(ketikKapital(e.target.value))}
              placeholder="mis. OPEN CASTING · FW 2026"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="a-link" className={labelClass}>
              Link (tujuan CTA)
            </label>
            <select
              id="a-link"
              value={linkMode === "custom" ? CUSTOM_LINK : link}
              onChange={(e) => {
                if (e.target.value === CUSTOM_LINK) {
                  setLinkMode("custom");
                  setLink(isPreset(link) ? "" : link);
                } else {
                  setLinkMode("preset");
                  setLink(e.target.value);
                }
              }}
              className={selectClass}
            >
              {LINK_PRESETS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
            {linkMode === "custom" && (
              <input
                type="text"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://contoh.com/daftar"
                className={`${inputClass} mt-2`}
              />
            )}
          </div>
        </div>

        <div>
          <label htmlFor="a-ringkasan" className={labelClass}>
            Ringkasan
          </label>
          <textarea
            id="a-ringkasan"
            value={ringkasan}
            onChange={(e) => setRingkasan(e.target.value)}
            rows={2}
            placeholder="Deskripsi singkat yang tampil di landing page"
            className="w-full border border-outline-variant bg-transparent p-3 focus:outline-none focus:border-primary text-body-md text-primary placeholder:text-outline-variant resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="a-deadline" className={labelClass}>
              Tenggat
            </label>
            <input
              id="a-deadline"
              type="date"
              value={tanggalBerakhir}
              onChange={(e) => setTanggalBerakhir(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="a-status" className={labelClass}>
              Status
            </label>
            <select
              id="a-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as AnnouncementStatus)}
              className={selectClass}
            >
              <option value="aktif">AKTIF (tampil di landing)</option>
              <option value="nonaktif">NONAKTIF (disembunyikan)</option>
            </select>
          </div>
        </div>

        <FileField
          label="Gambar poster"
          accept="image/*"
          value={poster}
          onChange={setPoster}
        />

        {feedback && (
          <p
            className={`text-caption uppercase tracking-[0.1em] ${
              feedback.tone === "success" ? "text-primary" : "text-error"
            }`}
          >
            {feedback.text}
          </p>
        )}

        <div className="flex justify-end gap-4 mt-1">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-primary text-on-primary text-label-uppercase hover:bg-accent transition-colors uppercase disabled:opacity-50"
          >
            {isLoading
              ? "MENYIMPAN…"
              : isEdit
                ? "Simpan Perubahan"
                : "Terbitkan"}
          </button>
        </div>
      </form>
    </section>
  );
}
