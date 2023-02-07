import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const loginApi = createApi({
  reducerPath: "login",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.REACT_APP_BASE_URL}/api`,
  }),
  endpoints: (builder) => {
    return {
      userLogin: builder.mutation({
        query: (body) => ({
          url: "/user/login",
          method: "POST",
          body,
        }),
      }),
    };
  },
});

export const { useUserLoginMutation } = loginApi;
