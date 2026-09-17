import NextImage, { type ImageProps } from "next/image";

/**
 * Pembungkus tipis di atas next/image.
 *
 * KENAPA: gambar hasil upload admin disimpan sebagai data URL base64 (mis.
 * "data:image/jpeg;base64,…"). Pipeline optimasi next/image (/_next/image)
 * tidak dapat memproses data URL sehingga gambar tampil kosong di halaman
 * publik. Untuk src berupa data URL, optimasi dimatikan (unoptimized) agar
 * browser me-render langsung; untuk URL biasa (mis. Unsplash) tetap lewat
 * optimasi seperti biasa.
 */
export function SmartImage(props: ImageProps) {
  const isDataUrl =
    typeof props.src === "string" && props.src.startsWith("data:");
  return <NextImage {...props} unoptimized={props.unoptimized ?? isDataUrl} />;
}
