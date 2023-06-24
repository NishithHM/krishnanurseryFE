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
            pageNumber.type = type;
          }
          return {
            url: `/variants`,
            params: params,
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
        query:({search,isCount, sortBy, pageNumber, sortType, isMinimumSelected
        })=>{
          const params = {sortType};
          if (search) {
            params.search = search;
          }
          if(isCount){
            params.isCount = isCount;
          }
          if(sortBy){
            params.sortBy = sortBy;
          }
          if(pageNumber){
            params.pageNumber = pageNumber
          }
          if(sortType){
            params.sortType = sortType
          }
          if(isMinimumSelected){
            params.onlyLow = isMinimumSelected
          }
          return {
            url: `/getAll`,
            params:params
          }
        }
      }),
      setAmount:builder.mutation({
      query: ({id, body}) => ({
        url: `/set-amounts/${id}`,
        method: 'POST',
        body,
      })
     })
    };
  },
});

export const {
  useGetAgriVariantsQuery,
  useGetAgriOptionsQuery,
  useGetAgriOptionValuesMutation,
  useGetAgriProcurementQuery,
  useSetAmountMutation
} = agriVariantsApi;
