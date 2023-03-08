import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "./helper";

const include_headers = Boolean(process.env.REACT_APP_HEADER_AUTHORIZATION);

export const customerApi = createApi({
  reducerPath: "customer",
  baseQuery:(args, api)=> baseQueryWithAuth(args, api, {
    baseUrl: `${process.env.REACT_APP_BASE_URL}/api/customer`,
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
      getCustomerByPhone: builder.query({
        query: (userNumber) => ({
          url: `/get-customer/${userNumber}`,
          method: "GET"
        }),
      }),
    };
  },
});

export const { useLazyGetCustomerByPhoneQuery } = customerApi;
