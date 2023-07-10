import React, { useContext, useState } from "react";
import { toast } from "react-toastify";
import { Toaster } from "../../components";
import { useReportMaintainenceMutation } from "../../services/procurement.services";
import styles from "./QuantityInput.module.css";
import { AuthContext } from "../../context";
const QuantityInput = ({ id, val = 12, maxValue = 100 }) => {
  const [value, setValue] = useState({ initial: val, updated: val });
  const [userCtx, setContext] = useContext(AuthContext);

  const [reportMaintainence, { isLoading }] = useReportMaintainenceMutation();

  const submitHandler = async () => {
    if (value.updated > maxValue || value.updated < 0)
       return toast.error("Under Maintainence Value should not exceed ");

    const res =  await reportMaintainence({ id, count: value.updated });
    if(res.error && res.error?.data?.error !== "" ) {
      return toast.error(res.error?.data?.error)
    }else if(res.error && res.error?.data?.error === "" ){
      return toast.error("Something went wrong! Please Try Again")
    }
    toast.success("Updated Successfully!");
    setValue((prev) => ({ ...prev, initial: prev.updated }));
  };
  return (
    <>
      <Toaster />
      <div className={styles.container}>
        <input
          className={styles.input}
          type="number"
          min={0}
          max={maxValue}
          value={value.updated}
          disabled={userCtx.role === "admin"}
          onChange={(e) => {
            setValue((prev) => ({ ...prev, updated: e.target.value }));
          }}
        />
        <button
          style={userCtx.role === "admin" ? {display : "none"} : {display : "flex"}}
          className={styles.button}
          disabled={
            value.initial === value.updated ||
            value.updated > maxValue ||
            isLoading
          }
          onClick={submitHandler}
        >
          Save
        </button>
      </div>
    </>
  );
};

export default QuantityInput;
