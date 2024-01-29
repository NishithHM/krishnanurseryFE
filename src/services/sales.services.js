import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "./helper";

const include_headers = Boolean(process.env.REACT_APP_HEADER_AUTHORIZATION);

export const salesApi = createApi({
  reducerPath: "sales",
  baseQuery: (args, api) =>
    baseQueryWithAuth(args, api, {
      baseUrl: `${process.env.REACT_APP_BASE_URL}/api/dashboard/`,
      ...(!include_headers && {
        credentials: "include",
      }),
      ...(include_headers && {
        headers: {
          Authorization: sessionStorage.getItem("authToken"),
        },
      }),
    }),

  endpoints: (builder) => {
    return {
      metaData: builder.mutation({
        query: ({ body }) => ({
          url: "/meta-data",
          method: "POST",
          body,
        }),
      }),
      graphData: builder.mutation({
        query: ({ body }) => ({
          url: "/meta-graph",
          method: "POST",
          body,
        }),
      }),
  
    };
  },
});

export const {
  useMetaDataMutation,
  useGraphDataMutation,
} = salesApi;
