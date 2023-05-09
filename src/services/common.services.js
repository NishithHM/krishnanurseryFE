import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "./helper";

const include_headers = Boolean(process.env.REACT_APP_HEADER_AUTHORIZATION);

export const commonApi = createApi({
  reducerPath: "vendor",
  baseQuery: (args, api) =>
    baseQueryWithAuth(args, api, {
      baseUrl: `${process.env.REACT_APP_BASE_URL}/api`,

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
      getVendor: builder.mutation({
        query: ({ id }) => ({
          url: `/vendors/${id}`,
          method: "GET",
        }),
      }),
    };
  },
});

export const { useGetVendorMutation } = commonApi;
