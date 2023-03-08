import React, { useState } from "react";
import { Button, Footer, Header, Input, Dropdown } from "../../components";
import isEmail from "validator/lib/isEmail";
import styles from "./employee.module.css";
import _ from "lodash";
import { useCreateUserMutation } from "../../services/user.services";
import { useNavigate } from "react-router-dom";

const Employee = () => {
  const defaultFormValues = {
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    role: "",
    errorFields: [],
  };
  const navigate = useNavigate();
  const [formState, setFormState] = useState(defaultFormValues);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [createUser, { isLoading, isError, isSuccess }] =
    useCreateUserMutation();

  const passwordRegexPattern =
    /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/;

  const EMPLOYEE_ROLES = [
    { label: "Admin", value: "admin" },
    { label: "Procurement Associate", value: "procurement" },
    { label: "Sales", value: "sales" },
    { label: "Pre sales", value: "preSales" },
  ];

  const validForm =
    formState.name !== "" &&
    formState.email !== "" &&
    formState.password !== "" &&
    formState.phoneNumber !== "" &&
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

  const formSubmitHandler = async (event) => {
    event.preventDefault();
    setFormSubmitted(true);
    var reqBody = { ...formState };
    delete reqBody.errorFields;
    const response = await createUser(reqBody);
    if (isError) console.log("Error creating a user");
    if (isSuccess) console.log("Success Creating the user");
    navigate("../dashboard/access-management");
    console.log(response);
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
            id="phoneNumber"
            type="number"
            errorMessage="Invalid Mobile Number"
            required
            validation={(number) => number.length === 10}
            value={formState.phoneNumber}
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
              loading={isLoading}
            />
          </div>
        </form>
      </div>
    </>
  );
};

export default Employee;
