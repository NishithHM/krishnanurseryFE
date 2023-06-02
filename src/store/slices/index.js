import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/dist/query";
import { billsApi } from "../../services/bills.service";
import { customerApi } from "../../services/customer.service";
import { categoriesApi } from "../../services/categories.services";
import { loginApi } from "../../services/login.services";
import { procurementsApi } from "../../services/procurement.services";
import { userApi } from "../../services/user.services";
import { commonApi } from "../../services/common.services";
import userSlice from "./user.slice";
import { paymentsApi } from "../../services/payments.services";
import { agriVariantsApi, useGetAgriVariantsQuery } from "../../services/agrivariants.services";
export const store = configureStore({
  reducer: {
    [loginApi.reducerPath]: loginApi.reducer,
    [procurementsApi.reducerPath]: procurementsApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [customerApi.reducerPath]: customerApi.reducer,
    [billsApi.reducerPath]: billsApi.reducer,
    [categoriesApi.reducerPath]: categoriesApi.reducer,
    [commonApi.reducerPath]: commonApi.reducer,
    [paymentsApi.reducerPath]: paymentsApi.reducer,
    [agriVariantsApi.reducerPath] : agriVariantsApi.reducer,
    userSlice: userSlice.reducer,
  },
  middleware: (middlewares) =>
    middlewares()
      .concat(loginApi.middleware)
      .concat(procurementsApi.middleware)
      .concat(userApi.middleware)
      .concat(customerApi.middleware)
      .concat(billsApi.middleware)
      .concat(categoriesApi.middleware)
      .concat(commonApi.middleware)
      .concat(paymentsApi.middleware)
      .concat(agriVariantsApi.middleware)
});

setupListeners(store.dispatch);
