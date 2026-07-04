import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export type LandingContent = {
  hero: {
    title: string;
    image: string;
    imageAlt: string;
    video: string;
  };
  essence: {
    eyebrow: string;
    body: string;
    ctaLabel: string;
    image: string;
    imageAlt: string;
  };
  capabilities: {
    eyebrow: string;
    items: { title: string; description: string }[];
  };
  cta: {
    title: string;
    body: string;
    buttonLabel: string;
  };
};

export const landingApi = createApi({
  reducerPath: "landingApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/" }),
  tagTypes: ["Landing"],
  endpoints: (builder) => ({
    getLanding: builder.query<LandingContent, void>({
      query: () => "landing",
      providesTags: [{ type: "Landing", id: "CONTENT" }],
    }),
    // Admin memperbarui konten landing (kirim section yang diubah).
    updateLanding: builder.mutation<LandingContent, Partial<LandingContent>>({
      query: (body) => ({ url: "admin/landing", method: "PATCH", body }),
      invalidatesTags: [{ type: "Landing", id: "CONTENT" }],
    }),
  }),
});

export const { useGetLandingQuery, useUpdateLandingMutation } = landingApi;
