import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const include_headers = Boolean(process.env.REACT_APP_HEADER_AUTHORIZATION);

export const procurementsApi = createApi({
  reducerPath: "procurements",
  baseQuery: fetchBaseQuery({
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
        query: ({body}) => ({
          url: "/create",
          method: "POST",
          body,
        }),
      }),
      getProcurements: builder.query({
        query: ({search, pageNumber, isCount})=>{
          const params ={ pageNumber, isCount}
          if(search){
            params.search = search
          }
          return{
          url:`/getAll`,
          params: params
        }}
      }),
      getProcurementHistory: builder.mutation({
        query: ({id,startDate, endDate, isCount, pageNumber})=>{
          const params ={id, startDate, endDate, pageNumber}
          if(isCount){
            params.isCount = isCount
          }
          return{
          url:`/getAllHistory`,
          params: params
        }}
      }),
      addProcurementVariants: builder.mutation({
        query:({id,body})=>({
          url:`/variants/${id}`,
          method: "POST",
          body
        }),
        invalidatesTags: ["procurements"],
      }),
      addMinimumQuantity: builder.mutation({
        query:({id, body})=>({
          url:`/minimumQuantity/${id}`,
          method:"POST",
          body
        })
      })
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
  useAddMinimumQuantityMutation
} = procurementsApi;
