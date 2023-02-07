import React, { useState } from "react";
import { Button, Footer, Header, Input, Dropdown } from "../../components";
import isEmail from 'validator/lib/isEmail';
import styles from "./employee.module.css";
import _ from "lodash";

const Employee = () => {
  const defaultFormValues = {
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "",
    errorFields: [],
  };
  const [formState, setFormState] = useState(defaultFormValues);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const passwordRegexPattern =
    /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/;
    
  const EMPLOYEE_ROLES = [
    { label: "Admin", value: "ADMIN" },
    { label: "Procurement Associate", value: "PROCUREMENT_ASSOCIATE" },
    { label: "Sales", value: "SALES" },
    { label: "Bill Manager", value: "BILL_MANAGER" },
  ];

  const validForm =
    formState.name !== "" &&
    formState.email !== "" &&
    formState.password !== "" &&
    formState.phone !== "" &&
    formState.role !== "" &&
    formState.errorFields.length === 0;

  const roleChangeHandler = (event) => {
    setFormState((prev) => {
      return {
        ...prev,
        role: event.value,
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
        errorFields: _.uniq([...prev.errorFields, id]),
      }));
    } else {
      const newErrorFields = formState.errorFields.filter((ele) => id != ele);
      setFormState((prev) => ({
        ...prev,
        errorFields: newErrorFields,
      }));
    }
  };

  const formSubmitHandler = (event) => {
    event.preventDefault();
    setFormSubmitted(true);
    console.log(formState);
  };

  return (
    <>
      <div className={styles.outerWrapper}>
        <h1 className={styles.header}>Add Employee</h1>

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
            title="Email"
            id="email"
            required={true}
            value={formState.email}
            type="email"
            errorMessage="Enter a Valid Email"
            validation={(email) => isEmail(email)}
            onChange={inputChangeHanlder}
            onError={inputErrorHandler}
          />
          <Input
            title="Password"
            id="password"
            required={true}
            value={formState.password}
            type="password"
            errorMessage="Password should contain Minimium of 6 chars, symbols and numbers"
            validation={(password) => passwordRegexPattern.test(password)}
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
          <Dropdown
            data={EMPLOYEE_ROLES}
            onChange={roleChangeHandler}
            title="Role"
            placeholder="Select Role"
            errorMessage="Select a Role"
            error={formState.role === "" && formSubmitted}
            required={true}
          />

          <div className={styles.formButton}>
            <Button
              disabled={!validForm}
              type="primary"
              title="Save"
              buttonType="submit"
            />
          </div>
        </form>
      </div>
    </>
  );
};

export default Employee;
