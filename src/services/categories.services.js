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
                query:({search,pageNumber,isCount,sortBy,sortType})=>{
                    const params = {pageNumber,isCount}
                    if(search){
                        params.search = search
                    } 
                    if(sortBy){
                        params.sortBy = sortBy
                    }
                    if(sortType){
                        params.sortType = sortType
                    }
                    if(isCount){
                        params.isCount = isCount
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
            }),
            createCategories: builder.mutation({
                query:({body})=>({
                    url:"/create",
                    method:"POST",
                    body
                }),
                invalidatesTags: ["categories"]
            })

        }
    }
})

export const {useGetAllCategoriesQuery, useDeleteCategoriesMutation, useCreateCategoriesMutation} = categoriesApi