import React, { useState } from "react";
import { DatePicker } from "@mantine/dates";
import { Button, Input, SelectPill } from "../../components";
import styles from "./CustomerOnboarding.module.css";
import { uniq } from "lodash";

const CustomerOnboarding = () => {
  const defaultFormValues = {
    phone: "",
    name: "",
    dateOfBirth: "",
    category: [],
    errorFields: [],
  };
  const [formState, setFormState] = useState(defaultFormValues);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const categoryOptions = [
    "item 1",
    "item 2",
    "this is item 3",
    "this is item 4 ",
    "item 5",
    "item 006",
  ];

  const validForm =
    formState.name !== "" &&
    formState.phone !== "" &&
    formState.dateOfBirth !== "" &&
    formState.category.length !== 0 &&
    formState.errorFields.length === 0;

  const dateChangeHandler = (event) => {
    setFormState((prev) => {
      return {
        ...prev,
        dateOfBirth: event.value,
      };
    });
  };
  const categoryChangeHandler = (e) => {
    setFormState((prev) => {
      return {
        ...prev,
        category: e,
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
        <Input
          title="Name"
          id="name"
          required={true}
          value={formState.name}
          type="text"
          errorMessage="Name Value Required"
          validation={(name) => name.length > 2}
          onChange={inputChangeHanlder}
          onError={inputErrorHandler}
        />

        <Input
          id="phone"
          type="number"
          errorMessage="Invalid Mobile Number"
          required
          validation={(number) => number.length === 10}
          value={formState.phone}
          onChange={inputChangeHanlder}
          title="Phone Number"
          onError={inputErrorHandler}
        />
        <div>
          <DatePicker
            placeholder="dd-mm-yyyy"
            label="Date Of Birth"
            inputFormat="DD/MM/YYYY"
            labelFormat="MMMM - YYYY"
            size="sm"
            withAsterisk
            value={formState.date}
            onChange={dateChangeHandler}
            clearable={false}
            styles={{
              label: {
                fontSize: "18px",
                marginBottom: "2px",
                fontFamily: "sans-serif",
                fontWeight: 500,
              },
              input: {
                border: "none",
                borderBottom: "1.5px solid black",
                borderRadius: 0,
                fontSize: "18px",
                fontWeight: 400,
              },
            }}
          />
          {formSubmitted && formState.dateOfBirth === "" && (
            <p style={{ color: "red", lineHeight: 0 }}>Select Date</p>
          )}
        </div>

        <div>
          <p
            style={{
              fontSize: "18px",
              lineHeight: 0,
              fontWeight: 400,
              fontFamily: "sans-serif",
            }}
          >
            Category <span style={{ color: "red" }}>*</span>
          </p>

          <SelectPill
            onChange={categoryChangeHandler}
            options={categoryOptions}
          />
          {formSubmitted && formState.category.length === 0 && (
            <p style={{ color: "red", lineHeight: 0 }}>
              Select atleast one category
            </p>
          )}
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

export default CustomerOnboarding;
