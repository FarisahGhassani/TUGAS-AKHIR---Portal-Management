"use client";

import { useState } from "react";
import { ketikKapital } from "@/lib/teksPublik";
import {
  useCreateBatchMutation,
  useUpdateBatchMutation,
  type ModellingBatch,
} from "@/store/api/dashboardApi";

const inputClass =
  "w-full border-0 border-b border-outline bg-transparent px-0 py-2 focus:outline-none focus:border-primary text-body-md text-primary placeholder:text-outline-variant transition-colors";
const labelClass = "text-label-uppercase text-secondary block uppercase mb-2";
const selectClass = `${inputClass} appearance-none rounded-none cursor-pointer pr-8`;

/**
 * Form tambah/edit batch kelas. Dipakai dari daftar kelas (/admin/classes) dan
 * halaman detail kelas — keduanya menulis lewat RTK Query, jadi kartu batch &
 * detail otomatis ter-refresh oleh tag "Batch".
 */
export function BatchForm({
  batch,
  onDone,
}: {
  batch: ModellingBatch | null;
  onDone: () => void;
}) {
  const [createBatch, { isLoading: creating }] = useCreateBatchMutation();
  const [updateBatch, { isLoading: updating }] = useUpdateBatchMutation();
  const isLoading = creating || updating;

  const [namaBatch, setNamaBatch] = useState(batch?.namaBatch ?? "");
  const [kuota, setKuota] = useState(batch ? String(batch.kuota) : "");
  const [tglMulai, setTglMulai] = useState(batch?.tglMulai ?? "");
  const [tglBerakhir, setTglBerakhir] = useState(batch?.tglBerakhir ?? "");
  const [statusPendaftaran, setStatusPendaftaran] = useState<"buka" | "tutup">(
    batch?.statusPendaftaran ?? "buka",
  );
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!namaBatch.trim()) return setError("Nama batch wajib diisi.");
    if (!kuota || Number(kuota) <= 0) return setError("Kuota tidak valid.");
    if (!tglMulai || !tglBerakhir)
      return setError("Tanggal mulai & berakhir wajib diisi.");

    const payload = {
      namaBatch: namaBatch.trim(),
      kuota: Number(kuota),
      tglMulai,
      tglBerakhir,
      statusPendaftaran,
    };

    try {
      if (batch) {
        await updateBatch({ id: batch.id, ...payload }).unwrap();
      } else {
        await createBatch(payload).unwrap();
      }
      onDone();
    } catch (err) {
      setError(
        err && typeof err === "object" && "data" in err
          ? ((err as { data?: { message?: string } }).data?.message ??
            "Gagal menyimpan batch.")
          : "Gagal menyimpan batch.",
      );
    }
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
      <div>
        <label htmlFor="b-nama" className={labelClass}>
          Nama Batch
        </label>
        <input
          id="b-nama"
          type="text"
          value={namaBatch}
          // Nama batch ikut tampil di form pendaftaran kelas (publik) → kapital.
          onChange={(e) => setNamaBatch(ketikKapital(e.target.value))}
          placeholder="mis. RUNWAY FUNDAMENTALS"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="b-kuota" className={labelClass}>
          Kuota
        </label>
        <input
          id="b-kuota"
          type="number"
          min={1}
          value={kuota}
          onChange={(e) => setKuota(e.target.value)}
          className={inputClass}
        />
        <p className="text-caption text-secondary tracking-[0.06em] mt-1">
          Nomor batch (Batch 01, 02, …) otomatis dari urutan.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="b-mulai" className={labelClass}>
            Tanggal Mulai
          </label>
          <input
            id="b-mulai"
            type="date"
            value={tglMulai}
            onChange={(e) => setTglMulai(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="b-berakhir" className={labelClass}>
            Tanggal Berakhir
          </label>
          <input
            id="b-berakhir"
            type="date"
            value={tglBerakhir}
            onChange={(e) => setTglBerakhir(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="b-status" className={labelClass}>
          Status Pendaftaran
        </label>
        <select
          id="b-status"
          value={statusPendaftaran}
          onChange={(e) =>
            setStatusPendaftaran(e.target.value as "buka" | "tutup")
          }
          className={selectClass}
        >
          <option value="buka">BUKA (bisa didaftari)</option>
          <option value="tutup">TUTUP (disembunyikan)</option>
        </select>
      </div>

      {error && (
        <p className="text-caption text-error uppercase tracking-[0.1em]">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-4 mt-1">
        <button
          type="button"
          onClick={onDone}
          className="px-6 py-3 border border-outline text-secondary text-label-uppercase hover:text-accent hover:border-accent transition-colors uppercase"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 bg-primary text-on-primary text-label-uppercase hover:bg-accent transition-colors uppercase disabled:opacity-50"
        >
          {isLoading ? "MENYIMPAN…" : batch ? "Simpan Perubahan" : "Tambah Batch"}
        </button>
      </div>
    </form>
  );
}
