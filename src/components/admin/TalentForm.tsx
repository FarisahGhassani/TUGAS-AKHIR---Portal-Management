"use client";

import { useState } from "react";
import { FileField, type PickedFile } from "@/components/dashboard/FileField";
import { UnitInput, CLOTHING_SIZES } from "@/components/dashboard/UnitInput";
import { parseShoeEu } from "@/mocks/data/talents";
import {
  useCreateTalentMutation,
  useUpdateTalentMutation,
  type Talent,
  type TalentGender,
  type TalentWorkCategory,
} from "@/store/api/talentApi";

const inputClass =
  "w-full border-0 border-b border-outline bg-transparent px-0 py-2 focus:outline-none focus:border-primary text-body-md text-primary placeholder:text-outline-variant transition-colors";
const labelClass = "text-label-uppercase text-secondary block uppercase mb-2";
const selectClass = `${inputClass} appearance-none rounded-none cursor-pointer pr-8`;

const genderOptions: { value: TalentGender; label: string }[] = [
  { value: "female", label: "FEMALE" },
  { value: "male", label: "MALE" },
];

const categoryOptions: { value: TalentWorkCategory; label: string }[] = [
  { value: "photoshoot", label: "PHOTOSHOOT" },
  { value: "runway", label: "RUNWAY" },
  { value: "tvc", label: "TVC" },
  { value: "commercial", label: "COMMERCIAL" },
  { value: "muse-beauty", label: "MUSE / BEAUTY" },
];

// Satu baris portfolio yang sedang diedit (image sebagai PickedFile supaya bisa
// di-preview; saat submit yang dikirim hanya dataUrl-nya).
type PortfolioDraft = {
  caption: string;
  alt: string;
  image: PickedFile | null;
};

function toDraft(p: Talent["portfolio"][number]): PortfolioDraft {
  return {
    caption: p.caption,
    alt: p.alt,
    image: { name: p.caption || "portfolio", type: "image/*", dataUrl: p.image },
  };
}

const emptyDraft = (): PortfolioDraft => ({
  caption: "",
  alt: "",
  image: null,
});

/**
 * Form tambah/edit talent. Field mengikuti data yang TERSEDIA di DB untuk talent
 * (= pendaftar lolos): nama, gender, ukuran tubuh (dari pendaftaran) + kategori
 * kerja, foto comcard, portfolio (dari tabel talent). Kategori dipilih lewat
 * ceklis (boleh lebih dari satu). slug & heightLabel diturunkan server. Semua
 * I/O lewat RTK mutation, jadi perubahan langsung tampil di sisi publik.
 *
 * State diinisialisasi langsung dari `editing` (lazy initial state). Pemanggil
 * memberi `key` per-talent sehingga form remount & ter-reset saat ganti target.
 */
export function TalentForm({
  editing,
  onDone,
}: {
  editing?: Talent | null;
  onDone?: () => void;
}) {
  const [createTalent, { isLoading: creating }] = useCreateTalentMutation();
  const [updateTalent, { isLoading: updating }] = useUpdateTalentMutation();
  const isLoading = creating || updating;
  const isEdit = Boolean(editing);

  const [name, setName] = useState(editing?.name ?? "");
  const [gender, setGender] = useState<TalentGender>(
    editing?.gender ?? "female",
  );
  const [categories, setCategories] = useState<TalentWorkCategory[]>(
    editing?.categories ?? [],
  );
  const [heightCm, setHeightCm] = useState(
    editing ? String(editing.heightCm) : "",
  );
  const [beratBadan, setBeratBadan] = useState(
    editing ? String(editing.measurements.beratBadan) : "",
  );
  const [sizeBaju, setSizeBaju] = useState(
    editing?.measurements.sizeBaju ?? "",
  );
  // DB/API menyimpan & menampilkan "42 EU / 8 UK"; form hanya butuh angka EU.
  const [sizeSepatu, setSizeSepatu] = useState(
    editing ? parseShoeEu(editing.measurements.sizeSepatu) : "",
  );
  const [instagram, setInstagram] = useState(editing?.instagram ?? "");
  const [cover, setCover] = useState<PickedFile | null>(
    editing
      ? { name: "current-cover", type: "image/*", dataUrl: editing.cover }
      : null,
  );
  const [coverAlt, setCoverAlt] = useState(editing?.coverAlt ?? "");
  const [portfolio, setPortfolio] = useState<PortfolioDraft[]>(
    editing ? editing.portfolio.map(toDraft) : [],
  );

  const [feedback, setFeedback] = useState<{
    tone: "success" | "error";
    text: string;
  } | null>(null);

  function toggleCategory(value: TalentWorkCategory) {
    setCategories((prev) =>
      prev.includes(value)
        ? prev.filter((c) => c !== value)
        : [...prev, value],
    );
  }

  function updatePortfolio(index: number, patch: Partial<PortfolioDraft>) {
    setPortfolio((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    if (!name.trim())
      return setFeedback({ tone: "error", text: "Nama wajib diisi." });
    if (categories.length === 0)
      return setFeedback({
        tone: "error",
        text: "Pilih minimal satu kategori kerja.",
      });
    if (!heightCm || Number(heightCm) <= 0)
      return setFeedback({ tone: "error", text: "Tinggi badan tidak valid." });
    if (!beratBadan || Number(beratBadan) <= 0)
      return setFeedback({ tone: "error", text: "Berat badan tidak valid." });
    if (!sizeBaju.trim())
      return setFeedback({ tone: "error", text: "Ukuran baju wajib diisi." });
    if (!sizeSepatu.trim())
      return setFeedback({ tone: "error", text: "Ukuran sepatu wajib diisi." });
    if (!instagram.trim())
      return setFeedback({ tone: "error", text: "Akun Instagram wajib diisi." });
    if (!cover?.dataUrl)
      return setFeedback({ tone: "error", text: "Unggah foto cover talent." });

    const payload = {
      name: name.trim(),
      gender,
      categories,
      heightCm: Number(heightCm),
      cover: cover.dataUrl,
      coverAlt: coverAlt.trim() || name.trim(),
      instagram: instagram.trim().replace(/^@+/, ""),
      measurements: {
        tinggiBadan: Number(heightCm),
        beratBadan: Number(beratBadan),
        sizeBaju: sizeBaju.trim(),
        sizeSepatu: sizeSepatu.trim(),
      },
      // Hanya baris dengan gambar yang ikut; id dirakit server.
      portfolio: portfolio
        .filter((p) => p.image?.dataUrl)
        .map((p) => ({
          id: "",
          caption: p.caption.trim() || "UNTITLED",
          image: p.image!.dataUrl,
          alt: p.alt.trim() || p.caption.trim() || name.trim(),
        })),
    };

    try {
      if (editing) {
        await updateTalent({ slug: editing.slug, ...payload }).unwrap();
        setFeedback({
          tone: "success",
          text: `Perubahan untuk ${payload.name} tersimpan.`,
        });
      } else {
        await createTalent(payload).unwrap();
        setFeedback({
          tone: "success",
          text: `${payload.name} ditambahkan ke roster.`,
        });
      }
      onDone?.();
    } catch (err) {
      const text =
        err && typeof err === "object" && "data" in err
          ? ((err as { data?: { message?: string } }).data?.message ??
            "Gagal menyimpan talent.")
          : "Gagal menyimpan talent.";
      setFeedback({ tone: "error", text });
    }
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="md:col-span-2">
          <label htmlFor="t-name" className={labelClass}>
            Nama Talent
          </label>
          <input
            id="t-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="mis. ANYA TAYLOR"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="t-gender" className={labelClass}>
            Gender
          </label>
          <select
            id="t-gender"
            value={gender}
            onChange={(e) => setGender(e.target.value as TalentGender)}
            className={selectClass}
          >
            {genderOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <span className={labelClass}>Kategori Kerja</span>
        <div className="flex flex-wrap gap-2">
          {categoryOptions.map((c) => {
            const active = categories.includes(c.value);
            return (
              <button
                key={c.value}
                type="button"
                onClick={() => toggleCategory(c.value)}
                className={`px-3 py-2 text-label-uppercase uppercase transition-colors border ${
                  active
                    ? "bg-primary text-on-primary border-primary"
                    : "border-outline text-secondary hover:text-accent"
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <div>
          <label htmlFor="t-height" className={labelClass}>
            Tinggi
          </label>
          <UnitInput
            id="t-height"
            value={heightCm}
            onChange={setHeightCm}
            unit="Cm"
          />
        </div>
        <div>
          <label htmlFor="t-weight" className={labelClass}>
            Berat
          </label>
          <UnitInput
            id="t-weight"
            value={beratBadan}
            onChange={setBeratBadan}
            unit="Kg"
          />
        </div>
        <div>
          <label htmlFor="t-clothing" className={labelClass}>
            Baju
          </label>
          <select
            id="t-clothing"
            value={sizeBaju}
            onChange={(e) => setSizeBaju(e.target.value)}
            className={selectClass}
          >
            <option value="">PILIH</option>
            {CLOTHING_SIZES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="t-shoe" className={labelClass}>
            Sepatu
          </label>
          {/* Input EU saja — UK dihitung otomatis di API ("42 EU / 8 UK"). */}
          <UnitInput
            id="t-shoe"
            value={sizeSepatu}
            onChange={setSizeSepatu}
            unit="EU"
            placeholder="40"
          />
        </div>
      </div>

      <div>
        <label htmlFor="t-ig" className={labelClass}>
          Instagram <span className="text-secondary">(portof / pribadi)</span>
        </label>
        <input
          id="t-ig"
          type="text"
          value={instagram}
          onChange={(e) => setInstagram(e.target.value)}
          placeholder="@username"
          className={inputClass}
        />
      </div>

      <FileField
        label="Foto comcard"
        accept="image/*"
        value={cover}
        onChange={setCover}
      />

      <div>
        <label htmlFor="t-coveralt" className={labelClass}>
          Teks alt foto <span className="text-secondary">(opsional)</span>
        </label>
        <input
          id="t-coveralt"
          type="text"
          value={coverAlt}
          onChange={(e) => setCoverAlt(e.target.value)}
          placeholder="Deskripsi foto untuk aksesibilitas"
          className={inputClass}
        />
      </div>

      {/* Portfolio — opsional, bisa ditambah beberapa karya. */}
      <div className="border-t border-outline-variant pt-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-label-uppercase text-secondary uppercase">
            Portfolio <span className="text-secondary">(opsional)</span>
          </span>
          <button
            type="button"
            onClick={() => setPortfolio((prev) => [...prev, emptyDraft()])}
            className="text-label-uppercase text-primary hover:text-accent transition-colors uppercase"
          >
            + Tambah karya
          </button>
        </div>

        {portfolio.length === 0 ? (
          <p className="text-caption text-on-surface-variant uppercase tracking-[0.1em]">
            Belum ada karya. Tambahkan untuk mengisi galeri portfolio.
          </p>
        ) : (
          <div className="flex flex-col gap-5">
            {portfolio.map((item, i) => (
              <div
                key={i}
                className="border border-outline-variant p-4 flex flex-col gap-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-caption text-secondary uppercase tracking-[0.1em]">
                    Karya {i + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setPortfolio((prev) =>
                        prev.filter((_, idx) => idx !== i),
                      )
                    }
                    className="text-label-uppercase text-secondary hover:text-error transition-colors uppercase"
                  >
                    Hapus
                  </button>
                </div>
                <div>
                  <label className={labelClass}>Caption</label>
                  <input
                    type="text"
                    value={item.caption}
                    onChange={(e) =>
                      updatePortfolio(i, { caption: e.target.value })
                    }
                    placeholder="mis. VOGUE ITALIA"
                    className={inputClass}
                  />
                </div>
                <FileField
                  label="Gambar karya"
                  accept="image/*"
                  value={item.image}
                  onChange={(file) => updatePortfolio(i, { image: file })}
                />
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
              : "Tambah Talent"}
        </button>
      </div>
    </form>
  );
}
