import { enableES5 } from "immer";
import React, { useState } from "react";
import { Button, Dropdown, Input } from "../../components";
import TextArea from "../../components/TextArea";
import styles from "./AddProcurement.module.css";

const AddProcurement = () => {
  const initialState = {
    totalQuantity: "",
    totalAmount: "",
    description: "",
  };
  const [selectedOption, setSelectedOption] = useState("");
  const [state, setState] = useState(initialState);

  const inputChangeHandler = (event, id) => {
    setState((prev) => {
      return {
        ...prev,
        [id]: event.target.value,
      };
    });
    console.log(id);
  };
  console.log(state, "state");
  const onHandleChange = (e) => {
    console.log(e);
    const selectedOption = e.value
    setSelectedOption(selectedOption)
  };
  return (
    <div className={styles.outerWrapper}>
      <h1 className={styles.header}>Add Procurement</h1>
      <div className={styles.innerWrapper}>
        <Dropdown
          url="/api/procurements/getAll"
          apiDataPath={{ label: "names.en.name", value: "_id" }}
          title="Plant Name"
          onChange={onHandleChange}
          value={selectedOption}
        />
        <Dropdown title="Plant Category" />
        <Dropdown onChange={onHandleChange} title="Vendor Name" />
        <div className={styles.inputWrapper}>
          <div className={styles.inputdiv}>
            <Input
              value={state.totalQuantity}
              id="totalQuantity"
              type="number"
              onChange={inputChangeHandler}
              title="Total Quantity"
            />
          </div>
          <div className={styles.secondinputdiv}>
            <Input
              value={state.totalAmount}
              id="totalAmount"
              type="number"
              onChange={inputChangeHandler}
              title="Total Amount"
            />
          </div>
        </div>
        <TextArea
          value={state.description}
          id="description"
          onChange={inputChangeHandler}
          title="Description"
          rows={4}
          name="description"
        />
        <div className={styles.formbtn}>
          <Button type="primary" title="Save" />
        </div>
      </div>
    </div>
  );
};

export default AddProcurement;
