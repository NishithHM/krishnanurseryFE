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
        Authorization:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYzZGI2N2UyODQyOTIxYzdiNDk2N2NhZiIsIm5hbWUiOiJhZG1pbjEiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE2NzU3NDc2NjUsImV4cCI6MTY3NTgzNDA2NX0.JcWab337hAIKQLArrVXNN7gGoZvl3HuBYqP5ImvnxoM",
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
        query: (product) => ({
          url: `/getAll?search=${product}`,
          method: "GET",
        }),
      }),
    };
  },
});

export const { useGetAllProcurementsQuery, useSearchProductsQuery } =
  procurementsApi;
