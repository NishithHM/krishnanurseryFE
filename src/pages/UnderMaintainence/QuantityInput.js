import React, { useState } from "react";
import { toast } from "react-toastify";
import { Toaster } from "../../components";
import { useReportMaintainenceMutation } from "../../services/procurement.services";
import styles from "./QuantityInput.module.css";
const QuantityInput = ({ id, val = 12, maxValue = 100 }) => {
  const [value, setValue] = useState({ initial: val, updated: val });

  const [reportMaintainence, { isLoading }] = useReportMaintainenceMutation();

  const submitHandler = async () => {
    if (value.updated > maxValue || value.updated < 0)
      return toast.error("Under Maintainence Value should not exceed ");

    await reportMaintainence({ id, count: value.updated });
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
          onChange={(e) => {
            setValue((prev) => ({ ...prev, updated: e.target.value }));
          }}
        />
        <button
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
