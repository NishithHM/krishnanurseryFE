import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "./helper";

const include_headers = Boolean(process.env.REACT_APP_HEADER_AUTHORIZATION);

export const userApi = createApi({
  reducerPath: "user",
  baseQuery:(args,api)=> baseQueryWithAuth(args, api,{
    baseUrl: `${process.env.REACT_APP_BASE_URL}/api/user`,
    ...(!include_headers && {
      credentials: "include",
    }),
    ...(include_headers && {
      headers: {
        Authorization: sessionStorage.getItem("authToken"),
      },
    }),
  }),
  tagTypes: ["User", "UserCount"],

  endpoints: (builder) => {
    return {
      createUser: builder.mutation({
        query: (userData) => ({
          url: "/create",
          method: "POST",
          body: userData,
        }),
        invalidatesTags: ["User", "UserCount"],
      }),
      getAllUsers: builder.query({
        query: (page = 1) => ({
          url: "/getAll",
          method: "GET",
          params: { pageNumber: page },
        }),
        providesTags: ["User"],
      }),
      getAllUsersCount: builder.query({
        query: () => ({
          url: "/getAll",
          method: "GET",
          params: { isCount: true },
        }),
        providesTags: ["UserCount"],
      }),
      searchUser: builder.mutation({
        query: (search = null) => ({
          url: "/getAll",
          method: "GET",
          params: { search },
        }),
      }),
      deleteUser: builder.mutation({
        query: (userId) => ({
          url: `/delete/${userId}`,
          method: "PUT",
        }),
        invalidatesTags: ["User", "UserCount"],
      }),
    };
  },
});

export const {
  useCreateUserMutation,
  useGetAllUsersQuery,
  useGetAllUsersCountQuery,
  useSearchUserMutation,
  useDeleteUserMutation,
} = userApi;
