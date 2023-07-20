import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "./helper";

const include_headers = Boolean(process.env.REACT_APP_HEADER_AUTHORIZATION);

export const agriBillsApi = createApi({
  reducerPath: "agriBills",
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
      getCustomerAgriCart: builder.query({
        query: (customerId) => ({
          url: `billing/get-cart/${customerId}`, // id ??
          method: "GET",
        }),
      }),
      checkoutAgriCart: builder.mutation({
        query: (cartData) => ({
          url: "billing/addToCart",
          method: "POST",
          body: cartData,
        }),
      }),
      updateAgriCart: builder.mutation({
        query: ({ cartId, updatedCartData }) => ({
          url: `billing/update-cart/${cartId}`,
          method: "POST",
          body: updatedCartData,
        }),
      }),
      submitAgriCart: builder.mutation({
        query: ({ cartId, cartRoundOff }) => ({
          url: `billing/confirm-cart/${cartId}`,
          method: "POST",
          body: cartRoundOff,
        }),
      }),

      getProductDetails: builder.mutation({
        query: ({ productData }) => ({
          url: `product-details`, // id ??
          method: "POST",
          body: productData,
        }),
      }),
    };
  },
});

export const {
  useLazyGetCustomerAgriCartQuery,
  useCheckoutAgriCartMutation,
  useUpdateAgriCartMutation,
  useSubmitAgriCartMutation,
  useGetProductDetailsMutation,
} = agriBillsApi;
