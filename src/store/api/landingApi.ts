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
  endpoints: (builder) => ({
    getLanding: builder.query<LandingContent, void>({
      query: () => "landing",
    }),
  }),
});

export const { useGetLandingQuery } = landingApi;
