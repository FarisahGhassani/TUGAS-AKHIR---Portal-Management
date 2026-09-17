"use client";

import { useState } from "react";
import { FileField, type PickedFile } from "@/components/dashboard/FileField";
import { ketikKapital } from "@/lib/teksPublik";
import {
  useCreateProjectMutation,
  useUpdateProjectMutation,
  type Project,
  type ProjectType,
  type ProjectCollaborator,
} from "@/store/api/projectsApi";

const inputClass =
  "w-full border-0 border-b border-outline bg-transparent px-0 py-2 focus:outline-none focus:border-primary text-body-md text-primary placeholder:text-outline-variant transition-colors";
const labelClass = "text-label-uppercase text-secondary block uppercase mb-2";
const selectClass = `${inputClass} appearance-none rounded-none cursor-pointer pr-8`;

const typeOptions: { value: ProjectType; label: string }[] = [
  { value: "event", label: "EVENT" },
  { value: "photoshoot", label: "PHOTOSHOOT" },
  { value: "other", label: "OTHER" },
];

// Baca dimensi natural gambar dari data URL untuk rasio kartu di sisi publik.
function readImageSize(dataUrl: string): Promise<{ w: number; h: number }> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => resolve({ w: 1200, h: 800 });
    img.src = dataUrl;
  });
}

/**
 * Form tambah/edit project — sistemnya seperti AnnouncementForm tetapi TANPA
 * tenggat. Field mengikuti model Project yang dipublish di halaman /projects:
 * judul, event, tipe, tanggal (→ dateLabel diturunkan server), cover, dan
 * kolaborator. State lazy-init dari `editing`; pemanggil memberi `key` agar
 * remount saat ganti target. Semua I/O lewat RTK mutation.
 */
export function ProjectForm({
  editing,
  onDone,
}: {
  editing?: Project | null;
  onDone?: () => void;
}) {
  const [createProject, { isLoading: creating }] = useCreateProjectMutation();
  const [updateProject, { isLoading: updating }] = useUpdateProjectMutation();
  const isLoading = creating || updating;
  const isEdit = Boolean(editing);

  const [title, setTitle] = useState(editing?.title ?? "");
  const [event, setEvent] = useState(editing?.event ?? "");
  const [type, setType] = useState<ProjectType>(editing?.type ?? "photoshoot");
  const [date, setDate] = useState(editing?.date ?? "");
  const [endDate, setEndDate] = useState(editing?.endDate ?? "");
  const [cover, setCover] = useState<PickedFile | null>(
    editing
      ? { name: "current-cover", type: "image/*", dataUrl: editing.cover }
      : null,
  );
  const [coverAlt, setCoverAlt] = useState(editing?.coverAlt ?? "");
  const [coverWidth, setCoverWidth] = useState(editing?.coverWidth ?? 0);
  const [coverHeight, setCoverHeight] = useState(editing?.coverHeight ?? 0);
  const [collaborators, setCollaborators] = useState<ProjectCollaborator[]>(
    editing?.collaborators ?? [],
  );

  const [feedback, setFeedback] = useState<{
    tone: "success" | "error";
    text: string;
  } | null>(null);

  async function handleCoverChange(file: PickedFile | null) {
    setCover(file);
    if (file?.dataUrl) {
      const { w, h } = await readImageSize(file.dataUrl);
      setCoverWidth(w);
      setCoverHeight(h);
    } else {
      setCoverWidth(0);
      setCoverHeight(0);
    }
  }

  function updateCollaborator(index: number, patch: Partial<ProjectCollaborator>) {
    setCollaborators((prev) =>
      prev.map((c, i) => (i === index ? { ...c, ...patch } : c)),
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFeedback(null);

    if (!title.trim())
      return setFeedback({ tone: "error", text: "Judul wajib diisi." });
    if (!event.trim())
      return setFeedback({ tone: "error", text: "Nama event wajib diisi." });
    if (!date)
      return setFeedback({ tone: "error", text: "Tanggal mulai wajib diisi." });
    if (endDate && endDate < date)
      return setFeedback({
        tone: "error",
        text: "Tanggal selesai tidak boleh sebelum tanggal mulai.",
      });
    if (!cover?.dataUrl)
      return setFeedback({ tone: "error", text: "Unggah cover project." });

    const payload = {
      title: title.trim(),
      event: event.trim(),
      type,
      date,
      endDate: endDate || undefined,
      cover: cover.dataUrl,
      coverAlt: coverAlt.trim() || title.trim(),
      coverWidth,
      coverHeight,
      collaborators: collaborators
        .filter((c) => c.name.trim())
        .map((c) => ({ name: c.name.trim(), role: c.role.trim() })),
    };

    try {
      if (editing) {
        await updateProject({ slug: editing.slug, ...payload }).unwrap();
        setFeedback({
          tone: "success",
          text: `Perubahan "${payload.title}" tersimpan.`,
        });
      } else {
        await createProject(payload).unwrap();
        setFeedback({
          tone: "success",
          text: `"${payload.title}" berhasil dipublikasikan.`,
        });
      }
      onDone?.();
    } catch (err) {
      const text =
        err && typeof err === "object" && "data" in err
          ? ((err as { data?: { message?: string } }).data?.message ??
            "Gagal menyimpan project.")
          : "Gagal menyimpan project.";
      setFeedback({ tone: "error", text });
    }
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
      <div>
        <label htmlFor="p-title" className={labelClass}>
          Judul Project
        </label>
        <input
          id="p-title"
          type="text"
          value={title}
          // Judul & event tampil di halaman publik → kapital otomatis.
          onChange={(e) => setTitle(ketikKapital(e.target.value))}
          placeholder="mis. AURORA · SS25 CAMPAIGN"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="p-event" className={labelClass}>
          Event
        </label>
        <input
          id="p-event"
          type="text"
          value={event}
          onChange={(e) => setEvent(ketikKapital(e.target.value))}
          placeholder="mis. PARIS FASHION WEEK"
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div>
          <label htmlFor="p-type" className={labelClass}>
            Tipe
          </label>
          <select
            id="p-type"
            value={type}
            onChange={(e) => setType(e.target.value as ProjectType)}
            className={selectClass}
          >
            {typeOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="p-date" className={labelClass}>
            Tanggal Mulai
          </label>
          <input
            id="p-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="p-enddate" className={labelClass}>
            Tanggal Selesai <span className="text-secondary">(opsional)</span>
          </label>
          <input
            id="p-enddate"
            type="date"
            value={endDate}
            min={date || undefined}
            onChange={(e) => setEndDate(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <FileField
        label="Cover"
        accept="image/*"
        value={cover}
        onChange={handleCoverChange}
      />

      <div>
        <label htmlFor="p-coveralt" className={labelClass}>
          Teks alt cover <span className="text-secondary">(opsional)</span>
        </label>
        <input
          id="p-coveralt"
          type="text"
          value={coverAlt}
          onChange={(e) => setCoverAlt(e.target.value)}
          placeholder="Deskripsikan gambar untuk aksesibilitas"
          className={inputClass}
        />
      </div>

      {/* Kolaborator — opsional, bisa beberapa baris (nama + peran). */}
      <div className="border-t border-outline-variant pt-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-label-uppercase text-secondary uppercase">
            Kolaborator <span className="text-secondary">(opsional)</span>
          </span>
          <button
            type="button"
            onClick={() =>
              setCollaborators((prev) => [...prev, { name: "", role: "" }])
            }
            className="text-label-uppercase text-primary hover:text-accent transition-colors uppercase"
          >
            + Tambah
          </button>
        </div>

        {collaborators.length === 0 ? (
          <p className="text-caption text-on-surface-variant uppercase tracking-[0.1em]">
            Belum ada kolaborator.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {collaborators.map((c, i) => (
              <div key={i} className="flex flex-wrap items-end gap-3">
                <div className="flex-1 min-w-[8rem]">
                  <input
                    type="text"
                    value={c.name}
                    onChange={(e) => updateCollaborator(i, { name: e.target.value })}
                    placeholder="Nama"
                    className={inputClass}
                  />
                </div>
                <div className="flex-1 min-w-[8rem]">
                  <input
                    type="text"
                    value={c.role}
                    onChange={(e) => updateCollaborator(i, { role: e.target.value })}
                    placeholder="Peran (mis. Photographer)"
                    className={inputClass}
                  />
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setCollaborators((prev) => prev.filter((_, idx) => idx !== i))
                  }
                  className="text-label-uppercase text-secondary hover:text-error transition-colors uppercase py-2"
                >
                  Hapus
                </button>
              </div>
            ))}
          </div>
        )}
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
        {onDone && (
          <button
            type="button"
            onClick={onDone}
            className="px-6 py-3 border border-outline text-secondary text-label-uppercase hover:text-accent hover:border-accent transition-colors uppercase"
          >
            Batal
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 bg-primary text-on-primary text-label-uppercase hover:bg-accent transition-colors uppercase disabled:opacity-50"
        >
          {isLoading
            ? "MENYIMPAN…"
            : isEdit
              ? "Simpan Perubahan"
              : "Publikasikan"}
        </button>
      </div>
    </form>
  );
}
