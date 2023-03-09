import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {baseQueryWithAuth} from './helper'
export const categoriesApi = createApi({
    reducerPath:"categories",
    baseQuery:(args, api) => baseQueryWithAuth(args, api,{
        baseUrl: `${process.env.REACT_APP_BASE_URL}/api/category`
    }),
    tagTypes: ["categories"],
    endpoints: (builder)=>{
        return {
            getAllCategories: builder.query({
                query:({search})=>{
                    const params = {}
                    if(search){
                        params.search = search
                    }
                    return{
                        url:`/getAll`,
                        params:params
                    }
                },
                providesTags: ["categories"],
            }),
            deleteCategories: builder.mutation({
                query:({id})=>{
                    return{
                        url:`/delete/${id}`,
                        method: 'PUT',
                    }
                },
                invalidatesTags: ["categories"]
            })
        }
    }
})

export const {useGetAllCategoriesQuery, useDeleteCategoriesMutation} = categoriesApi