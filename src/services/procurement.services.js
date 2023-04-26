import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "./helper";

const include_headers = Boolean(process.env.REACT_APP_HEADER_AUTHORIZATION);

export const procurementsApi = createApi({
  reducerPath: "procurements",
  baseQuery: (args, api) =>
    baseQueryWithAuth(args, api, {
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
  tagTypes: ["procurements"],
  endpoints: (builder) => {
    return {
      getAllProcurements: builder.query({
        query: () => ({
          url: "/getAll",
          method: "GET",
        }),
        providesTags: ["procurements"],
      }),

      //   getAllMinimumProcurements: builder.mutation({
      //     query: ({isCount, search, pageNumber, sortBy, sortType}) => {
      //         const params = {
      //             pageNumber,
      //             sortBy,
      //             sortType
      //         }
      //         if(isCount){
      //             params.isCount = isCount
      //         }
      //         if(search){
      //             params.search = search
      //         }
      //         return{
      //           url: "/low-quantity",
      //           method: "GET",
      //           params: params,
      //         }
      //     },
      //   }),

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
        query: ({ body }) => ({
          url: "/create",
          method: "POST",
          body,
        }),
      }),
      requestOrder: builder.mutation({
        query: ({ body }) => ({
          url: "/request-order",
          method: "POST",
          body,
        }),
      }),
      placeOrder: builder.mutation({
        query: ({ body }) => ({
          url: "/place-order",
          method: "POST",
          body,
        }),
      }),
      getProcurements: builder.query({
        query: ({
          search,
          pageNumber,
          isCount,
          sortBy,
          sortType,
          isMinimumSelected,
          isAll,
        }) => {
          const params = {
            pageNumber,
            isCount,
            sortBy,
            sortType,
          };
          if (search) {
            params.search = search;
          }
          if(isAll){
            params.isAll = isAll
          }
          return {
            url: isMinimumSelected ? "/low-quantity" : `/getAll`,
            params: params,
          };
        },
        providesTags: ["procurements"],
      }),
      getProcurementHistory: builder.mutation({
        query: ({ id, startDate, endDate, isCount, pageNumber }) => {
          const params = { id, startDate, endDate, pageNumber };
          if (isCount) {
            params.isCount = isCount;
          }
          return {
            url: `/getAllHistory`,
            params: params,
          };
        },
      }),
      addProcurementVariants: builder.mutation({
        query: ({ id, body }) => ({
          url: `/variants/${id}`,
          method: "POST",
          body,
        }),
        invalidatesTags: ["procurements"],
      }),
      addMinimumQuantity: builder.mutation({
        query: ({ id, body }) => ({
          url: `/minimumQuantity/${id}`,
          method: "POST",
          body,
        }),
      }),
      getOrders: builder.mutation({
        query: ({ body }) => ({
          url: `/get-orders`,
          method: "POST",
          body,
        }),
      }),
      rejectOrder: builder.mutation({
        query: (body) => ({
          url: `/reject-order`,
          method: "POST",
          body,
        }),
        invalidatesTags: ["procurements"],
      }),
      reportDamage: builder.mutation({
        query: ({ body, id }) => ({
          url: `/report-damage/${id}`,
          method: "POST",
          body,
        }),
      }),
      getProcurement: builder.mutation({
        query: ({ id }) => ({
          url: `/${id}`,
          method: "GET",
        }),
      }),
      getDamagesList: builder.mutation({
        query: ({ isCount, pageNumber, startDate, endDate, search }) => {
          const params = { startDate, endDate, pageNumber, search };
          if (isCount) {
            params.isCount = isCount;
          }
          return {
            url: `/get-damages`,
            method: "GET",
            params,
          };
        },
      }),
      verifyOrder: builder.mutation({
        query: (body) => ({
          url: `/verify-order`,
          method: "POST",
          body,
        }),
        invalidatesTags: ["procurements"],
      }),
      addOrderInvoice: builder.mutation({
        query: ({ id, body }) => ({
          url: `/add-invoice/${id}`,
          method: "POST",
          body,
        }),
        invalidatesTags: ["procurements"],
      }),
      reportMaintainence: builder.mutation({
        query: ({ id, count }) => ({
          url: `/report-maintenance/${id}?count=${count}`,
          method: "GET",
        }),
        invalidatesTags: ["procurements"],
      }),
    };
  },
});

export const {
  useGetAllProcurementsQuery,
  useSearchProductsQuery,
  useUpdateProcurementsMutation,
  useCreateProcurementsMutation,
  useGetProcurementsQuery,
  useGetProcurementHistoryMutation,
  useAddProcurementVariantsMutation,
  useAddMinimumQuantityMutation,
  useGetOrdersMutation,
  useRejectOrderMutation,
  useRequestOrderMutation,
  usePlaceOrderMutation,
  useReportDamageMutation,
  useGetProcurementMutation,
  useGetDamagesListMutation,
  useVerifyOrderMutation,
  useAddOrderInvoiceMutation,
  useReportMaintainenceMutation,
  //   useGetAllMinimumProcurementsMutation
} = procurementsApi;
