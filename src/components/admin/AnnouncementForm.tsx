"use client";

import { useEffect, useState } from "react";
import { FileField, type PickedFile } from "@/components/dashboard/FileField";
import {
  useCreateAnnouncementMutation,
  useUpdateAnnouncementMutation,
  type Announcement,
  type AnnouncementKategori,
  type AnnouncementStatus,
} from "@/store/api/announcementsApi";

const inputClass =
  "w-full border-0 border-b border-outline bg-transparent px-0 py-2 focus:outline-none focus:border-primary text-body-md text-primary placeholder:text-outline-variant transition-colors";
const labelClass = "text-label-uppercase text-secondary block uppercase mb-2";
const selectClass = `${inputClass} appearance-none rounded-none cursor-pointer pr-8`;

const kategoriOptions: { value: AnnouncementKategori; label: string }[] = [
  { value: "casting", label: "CASTING CALL" },
  { value: "kelas", label: "MODELLING CLASS" },
  { value: "umum", label: "BULLETIN" },
];

/**
 * Form create/edit pengumuman. Field-nya mengikuti model Announcement yang
 * dibaca landing page, jadi apa yang dibuat di sini langsung tampil di tab
 * Announcements. Poster diunggah lewat FileField (data URL). Saat `editing`
 * diisi, form berubah jadi mode edit. Semua I/O lewat RTK mutation.
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

  const [judul, setJudul] = useState("");
  const [ringkasan, setRingkasan] = useState("");
  const [kategori, setKategori] = useState<AnnouncementKategori>("casting");
  const [tanggalBerakhir, setTanggalBerakhir] = useState("");
  const [link, setLink] = useState("/auth");
  const [status, setStatus] = useState<AnnouncementStatus>("aktif");
  const [poster, setPoster] = useState<PickedFile | null>(null);
  const [fotoPosterAlt, setFotoPosterAlt] = useState("");

  const [feedback, setFeedback] = useState<{
    tone: "success" | "error";
    text: string;
  } | null>(null);

  // Sinkronkan field saat memilih item untuk diedit (atau reset ke kosong).
  useEffect(() => {
    setFeedback(null);
    if (editing) {
      setJudul(editing.judul);
      setRingkasan(editing.ringkasan);
      setKategori(editing.kategori);
      setTanggalBerakhir(editing.tanggalBerakhir);
      setLink(editing.link);
      setStatus(editing.status);
      setFotoPosterAlt(editing.fotoPosterAlt);
      // Poster lama ditampilkan sebagai preview; diganti hanya jika unggah baru.
      setPoster({
        name: "current-poster",
        type: "image/*",
        dataUrl: editing.fotoPoster,
      });
    } else {
      resetFields();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing]);

  function resetFields() {
    setJudul("");
    setRingkasan("");
    setKategori("casting");
    setTanggalBerakhir("");
    setLink("/auth");
    setStatus("aktif");
    setPoster(null);
    setFotoPosterAlt("");
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

    const payload = {
      judul: judul.trim(),
      ringkasan: ringkasan.trim(),
      kategori,
      fotoPoster: poster.dataUrl,
      fotoPosterAlt: fotoPosterAlt.trim() || judul.trim(),
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
    <section className="border border-outline-variant p-8 bg-surface">
      <div className="flex items-center justify-between gap-4 mb-6">
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

      <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor="a-judul" className={labelClass}>
            Judul
          </label>
          <input
            id="a-judul"
            type="text"
            value={judul}
            onChange={(e) => setJudul(e.target.value)}
            placeholder="mis. OPEN CASTING · FALL/WINTER 2026"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="a-ringkasan" className={labelClass}>
            Ringkasan
          </label>
          <textarea
            id="a-ringkasan"
            value={ringkasan}
            onChange={(e) => setRingkasan(e.target.value)}
            rows={3}
            placeholder="Deskripsi singkat yang tampil di landing page"
            className="w-full border border-outline-variant bg-transparent p-3 focus:outline-none focus:border-primary text-body-md text-primary placeholder:text-outline-variant resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label htmlFor="a-kategori" className={labelClass}>
              Kategori
            </label>
            <select
              id="a-kategori"
              value={kategori}
              onChange={(e) =>
                setKategori(e.target.value as AnnouncementKategori)
              }
              className={selectClass}
            >
              {kategoriOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
            <label htmlFor="a-link" className={labelClass}>
              Link (tujuan CTA)
            </label>
            <input
              id="a-link"
              type="text"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="/auth"
              className={inputClass}
            />
          </div>
        </div>

        <FileField
          label="Gambar poster"
          accept="image/*"
          value={poster}
          onChange={setPoster}
        />

        <div>
          <label htmlFor="a-alt" className={labelClass}>
            Teks alt poster <span className="text-secondary">(opsional)</span>
          </label>
          <input
            id="a-alt"
            type="text"
            value={fotoPosterAlt}
            onChange={(e) => setFotoPosterAlt(e.target.value)}
            placeholder="Deskripsikan poster untuk aksesibilitas"
            className={inputClass}
          />
        </div>

        {feedback && (
          <p
            className={`text-caption uppercase tracking-[0.1em] ${
              feedback.tone === "success" ? "text-primary" : "text-error"
            }`}
          >
            {feedback.text}
          </p>
        )}

        <div className="flex justify-end gap-4 mt-2">
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
