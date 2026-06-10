import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export type AgencyInfo = {
  name: string;
  tagline: string;
  location: {
    city: string;
    country: string;
  };
  contact: {
    whatsapp: {
      displayLabel: string;
      number: string;
    };
    instagram: {
      handle: string;
      url: string;
    };
  };
};

export const agencyApi = createApi({
  reducerPath: "agencyApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/" }),
  endpoints: (builder) => ({
    getAgencyInfo: builder.query<AgencyInfo, void>({
      query: () => "agency",
    }),
  }),
});

export const { useGetAgencyInfoQuery } = agencyApi;
