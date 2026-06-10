import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export type TalentDivision = "main" | "development" | "commercial";
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

export type TalentPortfolioItem = {
  id: string;
  caption: string;
  category: "editorial" | "campaign";
  image: string;
  alt: string;
  span?: "wide" | "tall";
};

export type Talent = {
  id: string;
  slug: string;
  name: string;
  division: TalentDivision;
  gender: TalentGender;
  categories: TalentWorkCategory[];
  heightCm: number;
  heightLabel: string;
  cover: string;
  coverAlt: string;
  thumbAspect: "3/4" | "4/5" | "1/1";
  bio: string;
  measurements: TalentMeasurement;
  portfolio: TalentPortfolioItem[];
};

export type TalentSummary = Pick<
  Talent,
  | "id"
  | "slug"
  | "name"
  | "division"
  | "gender"
  | "heightCm"
  | "heightLabel"
  | "cover"
  | "coverAlt"
  | "thumbAspect"
>;

export type TalentListQuery = {
  search?: string;
  division?: TalentDivision | "all";
  gender?: TalentGender | "all";
  category?: TalentWorkCategory | "all";
  minHeightCm?: number;
};

export const talentApi = createApi({
  reducerPath: "talentApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/" }),
  tagTypes: ["Talent"],
  endpoints: (builder) => ({
    getTalents: builder.query<TalentSummary[], TalentListQuery | void>({
      query: (params) => {
        const search = new URLSearchParams();
        if (params?.search) search.set("search", params.search);
        if (params?.division && params.division !== "all")
          search.set("division", params.division);
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
  }),
});

export const { useGetTalentsQuery, useGetTalentBySlugQuery } = talentApi;
