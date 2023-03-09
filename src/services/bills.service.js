import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "./helper";

const include_headers = Boolean(process.env.REACT_APP_HEADER_AUTHORIZATION);

export const billsApi = createApi({
  reducerPath: "bills",
  baseQuery: (args, api) =>
    baseQueryWithAuth(args, api, {
      baseUrl: `${process.env.REACT_APP_BASE_URL}/api/billing/`,
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
      getCustomerCart: builder.query({
        query: (customerId) => ({
          url: `get-cart/${customerId}`, // id ??
          method: "GET",
        }),
      }),
      checkoutCart: builder.mutation({
        query: (cartData) => ({
          url: "addToCart",
          method: "POST",
          body: cartData,
        }),
      }),
      updateCart: builder.mutation({
        query: ({ cartId, updatedCartData }) => ({
          url: `update-cart/${cartId}`,
          method: "POST",
          body: updatedCartData,
        }),
      }),
      submitCart: builder.mutation({
        query: ({ cartId, cartRoundOff }) => ({
          url: `confirm-cart/${cartId}`,
          method: "POST",
          body: cartRoundOff,
        }),
      }),
      // bills page endpoints
      getAllPurchases: builder.query({
        query: ({ page = 1, startDate, endDate, sortBy, sortType }) => {
            const params=  { pageNumber: page, startDate, endDate }
            if(sortBy){
                params.sortBy = sortBy
                params.sortType = sortType
            }
            return {
              url: "/history",
              method: "GET",
              params: params
            }
        },
        invalidatesTags: ["purchaseHistory"],
      }),
      getAllPurchasesCount: builder.query({
        query: ({ startDate, endDate }) => ({
          url: "/history",
          method: "GET",
          params: { isCount: true, startDate, endDate },
        }),
        providesTags: ["purchaseHistory"],
      }),
      searchPurchase: builder.mutation({
        query: ({ search = null, startDate, endDate }) => ({
          url: "/history",
          method: "GET",
          params: { search, startDate, endDate },
        }),
        invalidatesTags: ["purchaseHistory"],
      }),
    };
  },
});

export const {
  useLazyGetCustomerCartQuery,
  useCheckoutCartMutation,
  useUpdateCartMutation,
  useSubmitCartMutation,
  useGetAllPurchasesQuery,
  useGetAllPurchasesCountQuery,
  useSearchPurchaseMutation,
} = billsApi;
