import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name:"userSlice",
    initialState:{
        user:{}
    },
    reducers:{
        addUser(state, params){
            state.user = {...params.payload}
        }
    }
})

export const userActions = userSlice.actions
export default userSlice