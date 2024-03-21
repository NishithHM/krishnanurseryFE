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
      downloadBillingExcel: builder.mutation({
        query: ({ pageNumber, startDate, endDate }) => ({
          url: `/excel/billing?pageNumber=${pageNumber}&startDate=${startDate}&endDate=${endDate}`,
          method: "GET",
          responseHandler: async (response) => {
            return await response.blob()
          },
        }),
        transformResponse: (response, meta) => {
          console.log(meta, ';metea'); // <----- Here should be date value
          console.log(meta.response.headers.get('Count'))
          return {response, count:meta.response.headers.get('Count'), isNext:meta.response.headers.get('Isnext')};
        }
      }),
      downloadOrderExcel: builder.mutation({
        query: ({ pageNumber, startDate, endDate }) => ({
          url: `/excel/order-mgmt?pageNumber=${pageNumber}&startDate=${startDate}&endDate=${endDate}`,
          method: "GET",
          responseHandler: async (response) => {
            return await response.blob()
          },
        }),
        transformResponse: (response, meta) => {
          console.log(meta, ';metea'); // <----- Here should be date value
          console.log(meta.response.headers.get('Count'))
          return {response, count:meta.response.headers.get('Count'), isNext:meta.response.headers.get('Isnext')};
        }
      }),
      downloadDamagesExcel: builder.mutation({
        query: ({ pageNumber, startDate, endDate }) => ({
          url: `/excel/waste-mgmt?pageNumber=${pageNumber}&startDate=${startDate}&endDate=${endDate}`,
          method: "GET",
          responseHandler: async (response) => {
            return await response.blob()
          },
        }),
        transformResponse: (response, meta) => {
          console.log(meta, ';metea'); // <----- Here should be date value
          console.log(meta.response.headers.get('Count'))
          return {response, count:meta.response.headers.get('Count'), isNext:meta.response.headers.get('Isnext')};
        }
      }),

    };
  },
});

export const { useGetVendorMutation, useDownloadBillingExcelMutation, useDownloadDamagesExcelMutation, useDownloadOrderExcelMutation } = commonApi;
