import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name:"userSlice",
    initialState:{
        user:{},
        lostAuth: false,
        isGlobalError: false
    },
    reducers:{
        addUser(state, params){
            state.user = {...params.payload}
        },
        logout(state, params){
            state.lostAuth = true
        },
        globalError(state, params){
            state.isGlobalError = true
            setTimeout(()=>{
                state.isGlobalError = false
            }, 5000)
        }
    }
}) 

export const userActions = userSlice.actions
export default userSlice

