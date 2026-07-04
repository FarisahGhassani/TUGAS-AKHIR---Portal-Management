import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export type ProjectType = "event" | "photoshoot" | "other";

export type ProjectCollaborator = {
  name: string;
  role: string;
};

export type Project = {
  id: string;
  slug: string;
  /** Judul project / photoshoot. */
  title: string;
  /** Judul event tempat karya ini tampil. */
  event: string;
  type: ProjectType;
  /** Tanggal MULAI (ISO) — sumber kebenaran untuk pengurutan. */
  date: string;
  /** Tanggal SELESAI (ISO) — opsional; kosong = masih berjalan. */
  endDate?: string;
  /** Label timeline siap-tampil, mis. "March – May 2025" / "March 2025 – Present". */
  dateLabel: string;
  cover: string;
  coverAlt: string;
  /**
   * Dimensi natural gambar (px). Tinggi kartu dibuat seragam; lebar mengikuti
   * rasio asli gambar ini — jadi portrait/landscape menyesuaikan apa adanya,
   * bukan dipaksa ke satu rasio. Bergantung pada gambar yang diunggah nanti.
   */
  coverWidth: number;
  coverHeight: number;
  collaborators: ProjectCollaborator[];
};

export type ProjectListQuery = {
  search?: string;
  type?: ProjectType | "all";
};

// Payload create/edit dari panel admin. `id`, `slug`, dan `dateLabel`
// diturunkan server (mirip announcement, tapi tanpa tenggat/expiry).
export type ProjectInput = {
  title: string;
  event: string;
  type: ProjectType;
  date: string; // tanggal mulai, ISO (yyyy-mm-dd)
  endDate?: string; // tanggal selesai, ISO — opsional
  cover: string;
  coverAlt: string;
  coverWidth: number;
  coverHeight: number;
  collaborators: ProjectCollaborator[];
};

export const projectsApi = createApi({
  reducerPath: "projectsApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/" }),
  tagTypes: ["Project"],
  endpoints: (builder) => ({
    getProjects: builder.query<Project[], ProjectListQuery | void>({
      query: (params) => {
        const search = new URLSearchParams();
        if (params?.search) search.set("search", params.search);
        if (params?.type && params.type !== "all")
          search.set("type", params.type);
        const qs = search.toString();
        return `projects${qs ? `?${qs}` : ""}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Project" as const, id })),
              { type: "Project" as const, id: "LIST" },
            ]
          : [{ type: "Project" as const, id: "LIST" }],
    }),
    // Roster lengkap untuk panel admin (tanpa filter publik).
    getAllProjects: builder.query<Project[], void>({
      query: () => "admin/projects",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Project" as const, id })),
              { type: "Project" as const, id: "LIST" },
            ]
          : [{ type: "Project" as const, id: "LIST" }],
    }),
    createProject: builder.mutation<Project, ProjectInput>({
      query: (body) => ({ url: "admin/projects", method: "POST", body }),
      // LIST mencakup daftar publik & admin → keduanya refetch.
      invalidatesTags: [{ type: "Project", id: "LIST" }],
    }),
    updateProject: builder.mutation<
      Project,
      { slug: string } & ProjectInput
    >({
      query: ({ slug, ...body }) => ({
        url: `admin/projects/${slug}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: [{ type: "Project", id: "LIST" }],
    }),
    deleteProject: builder.mutation<{ slug: string }, string>({
      query: (slug) => ({ url: `admin/projects/${slug}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Project", id: "LIST" }],
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useGetAllProjectsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} = projectsApi;
