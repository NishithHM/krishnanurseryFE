import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "./helper";

const include_headers = Boolean(process.env.REACT_APP_HEADER_AUTHORIZATION);

export const onlineOrdersApi = createApi({
  reducerPath: "onlineOrders",
  baseQuery: (args, api) =>
    baseQueryWithAuth(args, api, {
      baseUrl: `${process.env.REACT_APP_BASE_URL}/api/controllers/customer/cart/`,
      ...(!include_headers && {
        credentials: "include",
      }),
      ...(include_headers && {
        headers: {
          Authorization: sessionStorage.getItem("authToken"),
        },
      }),
    }),
    tagTypes: ["onlineOrders"],

  endpoints: (builder) => {
    return {
      getAllOnlineOrders: builder.query({
        query: ({
          pageNumber = 1,
          startDate,
          endDate,
          sortBy,
          sortType,
          isCount
          
        }) => ({
          url: "/getPlacedCart",
          method: "GET",
          params: {
            pageNumber,
            startDate,
            endDate,
            sortBy,
            sortType,
            isCount
          },
        }),
        providesTags: ["onlineOrders"],
      }),
      approveOnlineOrder: builder.mutation({
        query: ({uuid, extraFee}) => ({
          url: `/approve/${uuid}`,
          method: "GET",
          params:{
            extraFee
          }
        }),
        invalidatesTags: ["onlineOrders"],
      }),
      rejecteOnlineOrder: builder.mutation({
        query: ({uuid}) => ({
          url: `/reject/${uuid}`,
          method: "GET",
        }),
        invalidatesTags: ["onlineOrders"],
      }),
    };
  },
});

export const {
  useGetAllOnlineOrdersQuery,
  useApproveOnlineOrderMutation,
  useRejecteOnlineOrderMutation
} = onlineOrdersApi;
