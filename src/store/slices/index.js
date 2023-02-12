import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/dist/query";
import { loginApi } from "../../services/login.services";
import { procurementsApi } from "../../services/procurement.services";
import { userApi } from "../../services/user.services";
import userSlice from "./user.slice";

export const store = configureStore({
  reducer: {
    [loginApi.reducerPath]: loginApi.reducer,
    [procurementsApi.reducerPath]: procurementsApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    userSlice: userSlice.reducer,
  },
  middleware: (middlewares) =>
    middlewares().concat(
      [loginApi.middleware],
      [procurementsApi.middleware],
      [userApi.middleware]
    ),
});

setupListeners(store.dispatch);
