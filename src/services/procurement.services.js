import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const procurementsApi = createApi({
  reducerPath: "procurements",
  baseQuery: fetchBaseQuery({ 
    baseUrl: "api/procurements",
    credentials: "include"
}),
endpoints:(builder)=>{
    return({
        getAllProcurements: builder.query({
            query:()=>({
                url:"/getAll",
                method: "GET",
            })
        })
    })
}
});

export const {useGetAllProcurementsQuery} = procurementsApi
