import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { userActions } from "../store/slices/user.slice";

export const baseQueryWithAuth =async (args, api, extraOptions)=>{
    const baseQuery = fetchBaseQuery({...extraOptions});
    let result = await baseQuery(args, api, extraOptions)
    if(result?.error?.status === 401){
        api.dispatch(userActions.logout())
    }
    if(result?.error?.status > 499){
        api.dispatch(userActions.globalError())
    }
    return result;
}