import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const loginApi = createApi({
  reducerPath: "login",
  baseQuery: fetchBaseQuery({ 
    baseUrl: "http://3.110.8.129:8000/api" 
}),
endpoints:(builder)=>{
    return({
        userLogin: builder.mutation({
            query:(body)=>({
                url:"/user/login",
                method: "POST",
                body
            })
        })
    })
}
});

export const {useUserLoginMutation} = loginApi
