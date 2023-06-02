import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "./helper";

const include_headers = Boolean(process.env.REACT_APP_HEADER_AUTHORIZATION);

export const agriVariantsApi = createApi({
    reducerPath: "agrivariants",
    baseQuery:(args, api) =>
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
                query: ({pageNumber, isCount, search, type}) => {
                    const params = {};
                    if(pageNumber){
                        params.pageNumber = pageNumber
                    }
                    if(isCount){
                        params.isCount = isCount
                    }
                    if(search){
                        params.search = search
                    }
                    if(type){
                        pageNumber.type = type
                    }
                    return {
                        url: `/variants`,
                        params: params,
                      };
                }
            })
        }
      }
})

export const {useGetAgriVariantsQuery} = agriVariantsApi