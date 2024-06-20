import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "./helper";

const include_headers = Boolean(process.env.REACT_APP_HEADER_AUTHORIZATION);

export const userApi = createApi({
  reducerPath: "user",
  baseQuery: (args, api) =>
    baseQueryWithAuth(args, api, {
      baseUrl: `${process.env.REACT_APP_BASE_URL}/api/vendors`,
      ...(!include_headers && {
        credentials: "include",
      }),
      ...(include_headers && {
        headers: {
          Authorization: sessionStorage.getItem("authToken"),
        },
      }),
    }),
  //tagTypes: ["User", "UserCount"],

  endpoints: (builder) => {
    return {
      getVendor: builder.query({
        query: (type) => ({
          url: "/getAll",
          method: "GET",
          params: {type}
        }),
        //invalidatesTags: ["User", "UserCount"],
      }),
    };
  },
});

export const {
 useGetVendorQuery
} = userApi;