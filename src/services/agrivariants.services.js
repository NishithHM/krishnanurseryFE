import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "./helper";

const include_headers = Boolean(process.env.REACT_APP_HEADER_AUTHORIZATION);

export const agriVariantsApi = createApi({
  reducerPath: "agrivariants",
  baseQuery: (args, api) =>
    baseQueryWithAuth(args, api, {
      baseUrl: `${process.env.REACT_APP_BASE_URL}/api/agri/`,
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
      getAgriVariants: builder.query({
        query: ({ pageNumber, isCount, search, type }) => {
          const params = {};
          if (pageNumber) {
            params.pageNumber = pageNumber;
          }
          if (isCount) {
            params.isCount = isCount;
          }
          if (search) {
            params.search = search;
          }
          if (type) {
            params.type = type;
          }
          return {
            url: `/variants`,
            params: params,
          };
        },
      }),
      getAgriVariant: builder.mutation({
        query: ({ id }) => {
          return {
            url: `/variants/${id}`,
          };
        },
      }),
      getAgriOptions: builder.query({
        query: () => ({
          url: `/types`,
          method: "GET",
        }),
      }),
      getAgriOptionValues: builder.mutation({
        query: ({ type }) => {
          const params = {};

          if (type) {
            params.type = type;
          }
          return {
            url: `/type-options`,
            params: params,
          };
        },
      }),
      getAgriProcurement: builder.query({
        query: ({
          search,
          isCount,
          sortBy,
          pageNumber,
          sortType,
          isMinimumSelected,
        }) => {
          const params = { sortType };
          if (search) {
            params.search = search;
          }
          if (isCount) {
            params.isCount = isCount;
          }
          if (sortBy) {
            params.sortBy = sortBy;
          }
          if (pageNumber) {
            params.pageNumber = pageNumber;
          }
          if (sortType) {
            params.sortType = sortType;
          }
          if (isMinimumSelected) {
            params.onlyLow = isMinimumSelected;
          }
          return {
            url: `/getAll`,
            params: params,
          };
        },
      }),
      setAmount: builder.mutation({
        query: ({ id, body }) => ({
          url: `/set-amounts/${id}`,
          method: "POST",
          body,
        }),
      }),
      updateAgriOptionValues: builder.mutation({
        query: ({ id, body }) => {
          return {
            url: `/variants/${id}`,
            method: "POST",
            body,
          };
        },
      }),
      getAgriVariantById: builder.mutation({
        query: ({ id }) => {
          return {
            url: `/variants/${id}`,
          };
        },
      }),
      deleteAgriVariantById: builder.mutation({
        query: ({ id }) => {
          return {
            url: `/delete-variant/${id}`,
            method: "GET",
          };
        },
      }),
      addAgriVariant: builder.mutation({
        query: (body) => {
          return {
            url: `/variants`,
            method: "POST",
            body,
          };
        },
      }),
      requestAgriOrder: builder.mutation({
        query: (body) => {
          return {
            url: `/request-order`,
            method: "POST",
            body,
          };
        },
      }),
      placeAgriOrder: builder.mutation({
        query: (body) => {
          return {
            url: `/place-order`,
            method: "POST",
            body,
          };
        },
      }),
      getOrders: builder.mutation({
        query: ({ body }) => ({
          url: `/order-list`,
          method: "POST",
          body,
        }),
      }),
      addOrderInvoice: builder.mutation({
        query: ({ id, body }) => ({
          url: `/add-invoice/${id}`,
          method: "POST",
          body,
        }),
        invalidatesTags: ["procurements"],
      }),
      getInvoice: builder.mutation({
        query: ({ id, page }) => ({
          url: `/order/${id}?page=${page}`,
          method: "GET",
        }),
      }),
      getOrderId: builder.mutation({
        query: ({ id }) => ({
          url: `/vendor-orders/${id}`,
          method: "GET",
        }),
      }),
      rejectOrder: builder.mutation({
        query: ({ body, id }) => ({
          url: `/reject-order/${id}`,
          method: "POST",
          Headers: { "content-type": "application/json" },
          body,
        }),
        // invalidatesTags: ["procurements"],
      }),
      verifyOrder: builder.mutation({
        query: ({ body, id }) => ({
          url: `/verify-order/${id}`,
          method: "POST",
          body,
        }),
        // invalidatesTags: ["procurements"],
      }),
    };
  },
});

export const {
  useGetAgriVariantsQuery,
  useGetAgriVariantMutation,
  useGetAgriOptionsQuery,
  useGetAgriOptionValuesMutation,
  useGetAgriProcurementQuery,
  useSetAmountMutation,
  useUpdateAgriOptionValuesMutation,
  useGetAgriVariantByIdMutation,
  useDeleteAgriVariantByIdMutation,
  useAddAgriVariantMutation,
  useRequestAgriOrderMutation,
  usePlaceAgriOrderMutation,
  useGetOrdersMutation,
  useAddOrderInvoiceMutation,
  useGetInvoiceMutation,
  useGetOrderIdMutation,
  useRejectOrderMutation,
  useVerifyOrderMutation,
} = agriVariantsApi;
