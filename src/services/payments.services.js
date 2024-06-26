import { createApi } from "@reduxjs/toolkit/query/react";
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
        query: ({ page = 1, startDate, endDate }) => ({
          url: "/getAll",
          method: "GET",
          params: { pageNumber: page, startDate, endDate },
        }),
        providesTags: ["User"],
      }),
      getAllPaymentsByPhoneNumber: builder.query({
        query: (phoneNumberAsParams) => ({
          url: "/get-info/" + phoneNumberAsParams,
          method: "GET",
        }),
      }),
      getAllPaymentsCount: builder.query({
        query: ({ search, startDate, endDate }) => {
          const options = {};
          if (search) options["search"] = search;

          if (startDate) options["startDate"] = startDate;
          if (endDate) options["endDate"] = endDate;

          return {
            url: "/getAll",
            method: "GET",
            params: { isCount: true, ...options },
          };
        },
        keepUnusedDataFor: 0,
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
  useGetAllPaymentsByPhoneNumberQuery,
  useGetAllPaymentsCountQuery,
  useSearchPaymentMutation,
} = paymentsApi;
