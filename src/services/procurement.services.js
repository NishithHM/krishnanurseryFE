import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const include_headers = Boolean(process.env.REACT_APP_HEADER_AUTHORIZATION);
console.log();
export const procurementsApi = createApi({
  reducerPath: "procurements",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.REACT_APP_BASE_URL}/api/procurements`,
    // credentials: "include",

    ...(include_headers && {
      headers: {
        Authorization: sessionStorage.getItem("authToken"),
      },
    }),
  }),
  endpoints: (builder) => {
    return {
      getAllProcurements: builder.query({
        query: () => ({
          url: "/getAll",
          method: "GET",
        }),
      }),
      searchProducts: builder.query({
        query: ({ searchQuery }) => ({
          url: `/getAll?search=${searchQuery}`,
          method: "GET",
        }),
      }),
    };
  },
});

export const { useGetAllProcurementsQuery, useSearchProductsQuery } =
  procurementsApi;
