import { createApi } from "@reduxjs/toolkit/query/react";
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
      getCustomerOnboarding:builder.mutation({
        query:(body)=>({
          url: `${process.env.REACT_APP_BASE_URL}/api/customer/create`,
          method:'POST',
          body
        })
      }),
      createBusinessCustomerOnboarding:builder.mutation({
        query:(body)=>({
          url: `${process.env.REACT_APP_BASE_URL}/api/customer/business/create`,
          method:'POST',
          body
        })
      }),
      getCustomersList: builder.query({
        query: ({pageNumber, search, isCount, type}) => {
          const params={}
          if (search) {
            params.search = search;
          }
          // if (sortBy) {
          //   params.sortBy = sortBy;
          // }
          // if (sortType) {
          //   params.sortType = sortType;
          // }
          if (isCount) {
            params.isCount = isCount;
          }
          if(type){
            params.type = type
          }
          if (pageNumber) {
            params.pageNumber = pageNumber;
          }
          return{
          url: `/list`,
          method: "GET",
          params: params,
          }
        },
      }),
    };
  },
});

export const { useLazyGetCustomerByPhoneQuery, useGetCustomerOnboardingMutation, useCreateBusinessCustomerOnboardingMutation, useGetCustomersListQuery } = customerApi;
