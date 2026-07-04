import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export type TalentGender = "female" | "male" | "non-binary";
export type TalentWorkCategory =
  | "photoshoot"
  | "runway"
  | "tvc"
  | "commercial"
  | "muse-beauty";

export type TalentMeasurement = {
  tinggiBadan: number; // cm
  beratBadan: number; // kg
  sizeBaju: string;
  sizeSepatu: string;
};

// Satu karya di galeri portfolio talent (disimpan sebagai JSON di
// talent.foto_portofolio). Hanya gambar + caption + alt — tanpa kategori/span,
// tata letak galeri ditentukan otomatis.
export type TalentPortfolioItem = {
  id: string;
  caption: string;
  image: string;
  alt: string;
};

// Talent = pendaftar yang lolos. Biodata (nama, gender, tinggi, ukuran) berasal
// dari tabel `pendaftaran`; kategori + comcard + portfolio dari tabel `talent`.
// Tidak ada divisi/bio/deskripsi — ditampilkan sesuai ketersediaan kolom DB.
export type Talent = {
  id: string;
  slug: string;
  name: string;
  gender: TalentGender;
  categories: TalentWorkCategory[];
  heightCm: number;
  heightLabel: string;
  cover: string;
  coverAlt: string;
  // Handle Instagram talent (tanpa "@") untuk tombol direct ke profil IG di
  // halaman detail. Wajib diisi (boleh akun portof atau pribadi).
  instagram: string;
  measurements: TalentMeasurement;
  portfolio: TalentPortfolioItem[];
};

export type TalentSummary = Pick<
  Talent,
  | "id"
  | "slug"
  | "name"
  | "gender"
  | "categories"
  | "heightCm"
  | "heightLabel"
  | "cover"
  | "coverAlt"
>;

export type TalentListQuery = {
  search?: string;
  gender?: TalentGender | "all";
  category?: TalentWorkCategory | "all";
  minHeightCm?: number;
};

// Payload create/edit dari panel admin. `slug`, `id`, dan `heightLabel`
// diturunkan server. Kategori dipilih lewat ceklis (boleh lebih dari satu).
export type TalentInput = {
  name: string;
  gender: TalentGender;
  categories: TalentWorkCategory[];
  heightCm: number;
  cover: string;
  coverAlt: string;
  instagram: string; // handle IG (tanpa "@"), wajib — boleh portof atau pribadi
  measurements: TalentMeasurement;
  portfolio: TalentPortfolioItem[];
};

// Status pendaftaran talent (= pendaftaran.status di DB).
export type TalentApplicationStatus =
  | "submitted"
  | "in_progress"
  | "accepted"
  | "rejected";

// Pendaftaran talent (jenis=talent) untuk panel approval admin di /admin/talent.
export type TalentApplication = {
  id: string;
  name: string;
  gender: TalentGender;
  heightCm: number;
  status: TalentApplicationStatus;
  appliedAt: string; // ISO date
  inCatalog: boolean; // sudah punya baris talent → tampil di katalog
};

// Detail lengkap data yang di-submit pelamar (untuk modal review admin sebelum
// memutuskan). Foto profil & portfolio = data URL.
export type TalentApplicationDetail = TalentApplication & {
  tanggalLahir: string;
  beratBadan: number;
  sizeBaju: string;
  sizeSepatu: string;
  noIdentitas: string;
  noTelepon: string;
  instagram?: string;
  fotoProfil: string;
  fotoPortofolio?: string;
};

export const talentApi = createApi({
  reducerPath: "talentApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/" }),
  tagTypes: ["Talent", "Application"],
  endpoints: (builder) => ({
    getTalents: builder.query<TalentSummary[], TalentListQuery | void>({
      query: (params) => {
        const search = new URLSearchParams();
        if (params?.search) search.set("search", params.search);
        if (params?.gender && params.gender !== "all")
          search.set("gender", params.gender);
        if (params?.category && params.category !== "all")
          search.set("category", params.category);
        if (params?.minHeightCm)
          search.set("minHeightCm", String(params.minHeightCm));
        const qs = search.toString();
        return `talents${qs ? `?${qs}` : ""}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Talent" as const, id })),
              { type: "Talent" as const, id: "LIST" },
            ]
          : [{ type: "Talent" as const, id: "LIST" }],
    }),
    getTalentBySlug: builder.query<Talent, string>({
      query: (slug) => `talents/${slug}`,
      providesTags: (_result, _error, slug) => [
        { type: "Talent", id: slug },
      ],
    }),
    // Roster lengkap (measurements, portfolio) untuk panel admin.
    getAllTalents: builder.query<Talent[], void>({
      query: () => "admin/talents",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Talent" as const, id })),
              { type: "Talent" as const, id: "LIST" },
            ]
          : [{ type: "Talent" as const, id: "LIST" }],
    }),
    createTalent: builder.mutation<Talent, TalentInput>({
      query: (body) => ({ url: "admin/talents", method: "POST", body }),
      // LIST mencakup roster admin DAN daftar talent publik → keduanya refetch.
      invalidatesTags: [{ type: "Talent", id: "LIST" }],
    }),
    updateTalent: builder.mutation<
      Talent,
      { slug: string } & TalentInput
    >({
      query: ({ slug, ...body }) => ({
        url: `admin/talents/${slug}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_r, _e, { slug }) => [
        { type: "Talent", id: slug },
        { type: "Talent", id: "LIST" },
      ],
    }),
    deleteTalent: builder.mutation<{ slug: string }, string>({
      query: (slug) => ({ url: `admin/talents/${slug}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, slug) => [
        { type: "Talent", id: slug },
        { type: "Talent", id: "LIST" },
      ],
    }),
    // Daftar pendaftaran talent (untuk approval admin di /admin/talent).
    getTalentApplications: builder.query<TalentApplication[], void>({
      query: () => "admin/talent-applications",
      providesTags: [{ type: "Application", id: "LIST" }],
    }),
    // Detail satu pendaftaran (data submitted lengkap) untuk modal review.
    getTalentApplicationDetail: builder.query<TalentApplicationDetail, string>({
      query: (id) => `admin/talent-applications/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Application", id }],
    }),
    // Putuskan pendaftaran: in_progress / accepted (→ masuk katalog) / rejected.
    decideTalentApplication: builder.mutation<
      TalentApplication,
      { id: string; status: TalentApplicationStatus }
    >({
      query: ({ id, status }) => ({
        url: `admin/talent-applications/${id}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: [
        { type: "Application", id: "LIST" },
        { type: "Talent", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetTalentsQuery,
  useGetTalentBySlugQuery,
  useGetAllTalentsQuery,
  useCreateTalentMutation,
  useUpdateTalentMutation,
  useDeleteTalentMutation,
  useGetTalentApplicationsQuery,
  useGetTalentApplicationDetailQuery,
  useDecideTalentApplicationMutation,
} = talentApi;
