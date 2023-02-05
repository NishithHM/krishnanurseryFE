import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/dist/query";
import { loginApi } from "../../services/login.services";
import { procurementsApi } from "../../services/procurement.services";
import userSlice from "./user.slice";

export const store = configureStore({
    reducer: {
        [loginApi.reducerPath]: loginApi.reducer,
        [procurementsApi.reducerPath]: procurementsApi.reducer,
        userSlice: userSlice.reducer
    },
    middleware:(middlewares)=> middlewares().concat([loginApi.middleware], [procurementsApi.middleware])
})

setupListeners(store.dispatch)