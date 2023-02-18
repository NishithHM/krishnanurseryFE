import React, { useState } from "react";
import { DatePicker } from "@mantine/dates";
import { Button, Input, SelectPill } from "../../components";
import styles from "./GenerateBill.module.css";
import { uniq } from "lodash";

const GenerateBill = () => {
  const defaultFormValues = {
    phone: "",
    name: "",
    dateOfBirth: "",
    cid: "",
    errorFields: [],
  };
  const [formState, setFormState] = useState(defaultFormValues);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const validForm =
    formState.name !== "" &&
    formState.phone !== "" &&
    formState.dateOfBirth !== "" &&
    formState.errorFields.length === 0;

  const dateChangeHandler = (event) => {
    setFormState((prev) => {
      return {
        ...prev,
        dateOfBirth: event.value,
      };
    });
  };

  const inputChangeHanlder = (event, id) => {
    setFormState((prev) => {
      return {
        ...prev,
        [id]: event.target.value,
      };
    });
  };

  const inputErrorHandler = ({ id, isError }) => {
    if (isError) {
      setFormState((prev) => ({
        ...prev,
        errorFields: uniq([...prev.errorFields, id]),
      }));
    } else {
      const newErrorFields = formState.errorFields.filter((ele) => id !== ele);
      setFormState((prev) => ({
        ...prev,
        errorFields: newErrorFields,
      }));
    }
  };

  const formSubmitHandler = (event) => {
    event.preventDefault();
    if (validForm) {
      setFormSubmitted(true);
      console.log(formState);
    }
  };
  return (
    <div className={styles.wrapper}>
      <form className={styles.innerWrapper} onSubmit={formSubmitHandler}>
        <div
          style={{
            display: "flex",
            width: "100%",
            alignItems: "flex-end",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <Input
            id="phone"
            type="number"
            errorMessage="Invalid Mobile Number"
            required={true}
            validation={(number) => number.length === 10}
            value={formState.phone}
            onChange={inputChangeHanlder}
            title="Phone Number"
            onError={inputErrorHandler}
          />
          <Input
            title="Name"
            id="name"
            value={formState.name}
            type="text"
            errorMessage="Name Value Required"
            validation={(name) => name.length > 2}
            onChange={inputChangeHanlder}
            onError={inputErrorHandler}
          />
        </div>

        <div
          style={{
            display: "flex",
            width: "100%",
            alignContent: "end",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <div>
            <DatePicker
              placeholder="dd-mm-yyyy"
              label="Date Of Birth"
              inputFormat="DD/MM/YYYY"
              labelFormat="MMMM - YYYY"
              size="sm"
              value={formState.date}
              onChange={dateChangeHandler}
              clearable={false}
              styles={{
                label: {
                  fontSize: "18px",
                  fontFamily: "sans-serif",
                  margin: 0,
                  padding: 0,
                  fontWeight: 500,
                },
                input: {
                  border: "none",
                  borderBottom: "1.5px solid black",
                  borderRadius: 0,
                  fontSize: "18px",
                  fontWeight: 400,
                  margin: 0,
                  flex: 1,
                },
              }}
            />
            {formSubmitted && formState.dateOfBirth === "" && (
              <p style={{ color: "red", lineHeight: 0 }}>Select Date</p>
            )}
          </div>

          <Input
            id="cid"
            type="text"
            required={true}
            value={formState.cid}
            onChange={inputChangeHanlder}
            title="Phone Number"
            onError={inputErrorHandler}
          />
        </div>
        <div className={styles.formButton}>
          <Button
            type="primary"
            title="Save"
            buttonType="submit"
            disabled={!validForm}
          />
        </div>
      </form>
    </div>
  );
};

export default GenerateBill;
