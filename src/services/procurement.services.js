import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const include_headers = Boolean(process.env.REACT_APP_HEADER_AUTHORIZATION);

export const procurementsApi = createApi({
  reducerPath: "procurements",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.REACT_APP_BASE_URL}/api/procurements`,

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
      updateProcurements: builder.mutation({
        query: ({ id, body }) => ({
          url: `/update/${id}`,
          method: "POST",
          body,
        }),
      }),
      createProcurements: builder.mutation({
        query: ({body}) => ({
          url: "/create",
          method: "POST",
          body,
        }),
      }),
    };
  },
});

export const {
  useGetAllProcurementsQuery,
  useSearchProductsQuery,
  useUpdateProcurementsMutation,
  useCreateProcurementsMutation,
} = procurementsApi;
