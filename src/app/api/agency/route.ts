import { agencyInfo } from "@/lib/agency";

// Identitas agency (nama, lokasi, kontak) untuk Footer. Isinya statis — tidak
// punya tabel di ERD dan tidak diubah admin — tapi tetap dilayani route handler
// sungguhan, bukan mock, supaya juga tersedia di build produksi.
export async function GET() {
  return Response.json(agencyInfo);
}
