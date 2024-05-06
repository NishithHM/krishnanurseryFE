import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { userActions } from "../store/slices/user.slice";
import axios from "axios";

export const baseQueryWithAuth = async (args, api, extraOptions) => {
  const baseQuery = fetchBaseQuery({ ...extraOptions });
  let result = await baseQuery(args, api, extraOptions);
  if (result?.error?.status === 401) {
    api.dispatch(userActions.logout());
  }
  if (result?.error?.status > 499) {
    api.dispatch(userActions.globalError());
  }
  return result;
};

/*
 * Function to download file
 * @param {String} fileName
 * @returns {Promise}
 */
export const downloadFile = async (url) => {
  const res = await axios.get(
    `${process.env.REACT_APP_BASE_URL}/api/download?path=${url}`,
    {
      responseType: "blob",
      headers: {
        Authorization: sessionStorage.getItem("authToken"),
      },
    }
  );

  return res?.data;
};

/*
 * Function to create blob URL
 * @param {Blob} blob
 * @returns {String}
 */
export const createBlobURL = (blob) => {
  return URL.createObjectURL(blob);
};
