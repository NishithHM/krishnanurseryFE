import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name:"userSlice",
    initialState:{
        user:{},
        lostAuth: false
    },
    reducers:{
        addUser(state, params){
            state.user = {...params.payload}
        },
        logout(state, params){
            state.lostAuth = true
        }
    }
})

export const userActions = userSlice.actions
export default userSlice