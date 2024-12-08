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
      }),
      approveOnlineOrder: builder.mutation({
        query: ({uuid, extraFee}) => ({
          url: `/approve/${uuid}`,
          method: "GET",
          params:{
            extraFee
          }
        }),
      }),
    };
  },
});

export const {
  useGetAllOnlineOrdersQuery,
  useApproveOnlineOrderMutation
} = onlineOrdersApi;
