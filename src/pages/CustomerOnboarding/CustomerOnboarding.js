import React, { useState } from "react";
import { DatePicker } from "@mantine/dates";
import { Button, Footer, Header, Input, SelectPill } from "../../components";
import styles from "./CustomerOnboarding.module.css";
import { uniq } from "lodash";
import { useGetAllCategoriesQuery } from "../../services/categories.services";
import { useGetCustomerOnboardingMutation } from "../../services/customer.service";
import { Toaster } from "../../components";
import { toast } from "react-toastify";

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
  const { data } = useGetAllCategoriesQuery({});

  const categoryOptions = data?.map((ele) => ele?.names?.en?.name);
  const [customer] = useGetCustomerOnboardingMutation();

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
        dateOfBirth: event,
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
    }
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    const res = await customer({
      name: formState.name,
      phoneNumber: formState.phone,
      dob: formState.dateOfBirth,
      categoryList: formState.category.map((ele) => {
        const { _id, names } = data.find((val) => val?.names?.en?.name === ele);
        return {
          id: _id,
          categoryNameInEnglish: ele,
          categoryNameInKannada: names?.ka?.name,
        };
      }),
    });
    if (res.error) {
      toast.error(res?.error?.data.error);
    } else {
      toast.success("Thank You For Registering!!!");
    }
  };
  return (
    <>
    <Header />
    <div className={styles.wrapper}>
      <Toaster />
      <form className={styles.innerWrapper} onSubmit={formSubmitHandler}>
        <Input
          title="Name"
          id="name"
          required={true}
          value={formState.name}
          type="text"
          errorMessage="Name must contain only Alphabets"
          validation={(name) => /[A-Za-z]/.test(name)}
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
            className={styles.dateText}
            placeholder="dd-mm-yyyy"
            label="Date Of Birth"
            inputFormat="DD/MM/YYYY"
            labelFormat="MMMM - YYYY"
            size="sm"
            withAsterisk
            value={formState.date}
            onChange={dateChangeHandler}
            clearable={false}
            maxDate={new Date()}
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
          className={styles.categoryText}
          >
            Category <span style={{ color: "red" }}>*</span>
          </p>
          <div className={styles.selectPill}>
          <SelectPill
            onChange={categoryChangeHandler}
            options={categoryOptions}
          />
          </div>
          {formSubmitted && formState.category.length === 0 && (
            <p style={{ color: "red", lineHeight: 0 }}>
              Select atleast one category
            </p>
          )}
        </div>
        <div className={styles.formButton}>
          <Button
            onClick={onSubmitHandler}
            type="primary"
            title="Save"
            buttonType="submit"
            disabled={!validForm}
          />
        </div>
      </form>
    </div>
    <Footer />
    </>
  );
};

export default CustomerOnboarding;
