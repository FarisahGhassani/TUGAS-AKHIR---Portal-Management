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
  /** ISO date — sumber kebenaran untuk pengurutan. */
  date: string;
  /** Label tanggal yang siap ditampilkan, mis. "March 2025". */
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
  }),
});

export const { useGetProjectsQuery } = projectsApi;
