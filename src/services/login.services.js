import { createApi } from "@reduxjs/toolkit/query/react";
import {baseQueryWithAuth} from './helper'

export const loginApi = createApi({
  reducerPath: "login",
  baseQuery:(args, api)=> baseQueryWithAuth(args, api, {
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
