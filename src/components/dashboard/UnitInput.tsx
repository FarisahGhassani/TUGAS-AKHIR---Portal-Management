"use client";

// Input angka dengan SATUAN yang otomatis "tertulis" mengikuti angka setelah
// diketik (mis. ketik 175 → tampil "175  Cm"). Satuan hanya muncul saat sudah
// ada nilai supaya placeholder tetap bersih. Garis bawah (border) dipindah ke
// wrapper agar input + satuan terlihat sebagai satu field.
export function UnitInput({
  id,
  value,
  onChange,
  unit,
  min = 1,
  placeholder,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  unit: string;
  min?: number;
  placeholder?: string;
}) {
  return (
    <div className="flex items-baseline border-b border-outline focus-within:border-primary transition-colors">
      <input
        id={id}
        type="number"
        min={min}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 border-0 bg-transparent px-0 py-2 focus:outline-none text-body-md text-primary placeholder:text-outline-variant"
      />
      {value.trim() !== "" && (
        <span className="select-none pl-2 pb-2 text-body-md text-secondary">
          {unit}
        </span>
      )}
    </div>
  );
}

// Pilihan ukuran baju standar (sudah kapital — "auto capslock"). Dipakai di form
// pendaftaran & form admin agar konsisten.
export const CLOTHING_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"] as const;
