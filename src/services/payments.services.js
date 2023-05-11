import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "./helper";

const include_headers = Boolean(process.env.REACT_APP_HEADER_AUTHORIZATION);

export const paymentsApi = createApi({
  reducerPath: "payments",
  baseQuery: (args, api) =>
    baseQueryWithAuth(args, api, {
      baseUrl: `${process.env.REACT_APP_BASE_URL}/api/payments`,
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
      createPayment: builder.mutation({
        query: (paymentData) => ({
          url: "/addPayment",
          method: "POST",
          body: paymentData,
        }),
        invalidatesTags: ["User", "UserCount"],
      }),
      getAllPayments: builder.query({
        query: (page = 1) => ({
          url: "/getAll",
          method: "GET",
          params: { pageNumber: page },
        }),
        providesTags: ["User"],
      }),
      getAllPaymentsCount: builder.query({
        query: ({ search }) => {
          const options = {};
          if (search) options["search"] = search;
          return {
            url: "/getAll",
            method: "GET",
            params: { isCount: true, ...options },
          };
        },
        providesTags: ["UserCount"],
      }),
      searchPayment: builder.mutation({
        query: (search = null) => ({
          url: "/getAll",
          method: "GET",
          params: { search },
        }),
      }),
    };
  },
});

export const {
  useCreatePaymentMutation,
  useGetAllPaymentsQuery,
  useGetAllPaymentsCountQuery,
  useSearchPaymentMutation,
} = paymentsApi;
