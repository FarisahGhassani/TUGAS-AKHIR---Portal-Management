// ---------------------------------------------------------------------------
// Pemrosesan file upload di sisi klien.
//
// KENAPA: gambar disimpan sebagai data URL base64 di kolom LongText MySQL.
// MariaDB (XAMPP) menolak query yang melebihi `max_allowed_packet` (default
// ~1MB) dengan "Server has closed the connection" → simpan GAGAL. Foto kamera
// 3–5MB jelas menembus batas itu.
//
// SOLUSI: gambar di-decode ke <canvas>, diperkecil dimensinya, lalu di-encode
// ulang jadi JPEG dengan kualitas yang diturunkan bertahap sampai ukuran base64
// aman di bawah batas. Hasilnya row DB kecil, halaman pun lebih ringan. Berkas
// non-raster (PDF, SVG, GIF) dilewatkan apa adanya — pemanggil yang menjaga
// batas ukurannya.
// ---------------------------------------------------------------------------

export type ProcessedFile = { dataUrl: string; type: string };

// Sisi terpanjang gambar dibatasi sini (px). 1600 cukup tajam untuk hero/poster.
const MAX_DIMENSION = 1600;
// Target panjang string base64 (~520KB biner) — jauh di bawah packet 1MB.
const TARGET_BASE64_CHARS = 700_000;

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error("read failed"));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image decode failed"));
    img.src = src;
  });
}

// Tipe raster yang aman di-encode ulang ke JPEG.
function isCompressibleImage(type: string): boolean {
  return (
    type === "image/jpeg" ||
    type === "image/jpg" ||
    type === "image/png" ||
    type === "image/webp" ||
    type === "image/bmp"
  );
}

export async function processUpload(file: File): Promise<ProcessedFile> {
  const original = await readAsDataUrl(file);

  // Non-raster (PDF, GIF beranimasi, SVG) — jangan diutak-atik.
  if (!isCompressibleImage(file.type)) {
    return { dataUrl: original, type: file.type };
  }

  let img: HTMLImageElement;
  try {
    img = await loadImage(original);
  } catch {
    // Kalau gagal decode, kembalikan asli — biar validasi ukuran pemanggil
    // yang memutuskan.
    return { dataUrl: original, type: file.type };
  }

  const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
  let width = Math.max(1, Math.round(img.width * scale));
  let height = Math.max(1, Math.round(img.height * scale));

  const draw = (w: number, h: number, quality: number): string => {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return original;
    // Latar putih supaya area transparan PNG tidak jadi hitam saat ke JPEG.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    return canvas.toDataURL("image/jpeg", quality);
  };

  let quality = 0.82;
  let out = draw(width, height, quality);

  // 1) Turunkan kualitas dulu.
  while (out.length > TARGET_BASE64_CHARS && quality > 0.4) {
    quality -= 0.12;
    out = draw(width, height, quality);
  }
  // 2) Kalau masih besar, kecilkan dimensi bertahap (batas bawah 640px).
  while (out.length > TARGET_BASE64_CHARS && width > 640) {
    width = Math.round(width * 0.8);
    height = Math.round(height * 0.8);
    out = draw(width, height, 0.7);
  }

  // Kalau entah kenapa hasil kompres malah lebih besar dari asli, pakai asli.
  return out.length < original.length
    ? { dataUrl: out, type: "image/jpeg" }
    : { dataUrl: original, type: file.type };
}
