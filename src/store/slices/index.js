import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/dist/query";
import { loginApi } from "../../services/loginapi/login.services";
import userSlice from "./user.slice";

export const store = configureStore({
    reducer: {
        [loginApi.reducerPath]: loginApi.reducer,
        userSlice: userSlice.reducer
    },
    middleware:(middlewares)=> middlewares().concat([loginApi.middleware])
})

setupListeners(store.dispatch)