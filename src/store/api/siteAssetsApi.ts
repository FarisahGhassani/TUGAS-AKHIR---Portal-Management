import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Aset situs yang bisa diganti admin. Nilai = URL (hero video) atau URL/data URL
// (gambar). Kosong "" → halaman pakai default bawaannya.
export type SiteAssets = {
  heroVideo: string; // main asset video di bawah hero (URL)
  essenceImage: string; // gambar section essence (URL/upload)
  authImage: string; // gambar halaman auth (URL/upload)
};

export type SiteAssetKey = "hero_video" | "essence_image" | "auth_image";

export const siteAssetsApi = createApi({
  reducerPath: "siteAssetsApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/" }),
  tagTypes: ["SiteAssets"],
  endpoints: (builder) => ({
    getSiteAssets: builder.query<SiteAssets, void>({
      query: () => "site-assets",
      providesTags: [{ type: "SiteAssets", id: "ALL" }],
    }),
    updateSiteAsset: builder.mutation<
      SiteAssets,
      { key: SiteAssetKey; value: string }
    >({
      query: (body) => ({ url: "admin/site-assets", method: "PATCH", body }),
      invalidatesTags: [{ type: "SiteAssets", id: "ALL" }],
    }),
  }),
});

export const { useGetSiteAssetsQuery, useUpdateSiteAssetMutation } =
  siteAssetsApi;
