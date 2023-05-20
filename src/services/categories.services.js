import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { baseQueryWithAuth } from "./helper";

const include_headers = Boolean(process.env.REACT_APP_HEADER_AUTHORIZATION);

export const categoriesApi = createApi({
  reducerPath: "categories",
  baseQuery: (args, api) =>
    baseQueryWithAuth(args, api, {
      baseUrl: `${process.env.REACT_APP_BASE_URL}/api/category`,
      ...(!include_headers && {
        credentials: "include",
      }),
      ...(include_headers && {
        headers: {
          Authorization: sessionStorage.getItem("authToken"),
        },
      }),
    }),
  tagTypes: ["categories"],
  endpoints: (builder) => {
    return {
      getAllCategories: builder.query({
        query: ({ search, pageNumber, isCount, sortBy, sortType }) => {
          const params = { sortType };
          if (search) {
            params.search = search;
          }
          if (sortBy) {
            params.sortBy = sortBy;
          }
          if (sortType) {
            params.sortType = sortType;
          }
          if (isCount) {
            params.isCount = isCount;
          }
          if (pageNumber) {
            params.pageNumber = isCount;
          }
          return {
            url: `/getAll`,
            params: params,
          };
        },
        providesTags: ["categories"],
      }),
      deleteCategories: builder.mutation({
        query: ({ id }) => {
          return {
            url: `/delete/${id}`,
            method: "PUT",
          };
        },
        invalidatesTags: ["categories"],
      }),
      createCategories: builder.mutation({
        query: ({ body }) => ({
          url: "/create",
          method: "POST",
          body,
        }),
        invalidatesTags: ["categories"],
      })
    };
  },
});

export const {
  useGetAllCategoriesQuery,
  useDeleteCategoriesMutation,
  useCreateCategoriesMutation
} = categoriesApi;
