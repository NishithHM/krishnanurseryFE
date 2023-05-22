import React, { useContext, useState } from "react";
import styles from "./login.module.css";
import logo from "../../assets/images/logo.png";
import { Button, Input } from "../../components";
import _ from "lodash";
import { useUserLoginMutation } from "../../services/login.services";
import { userActions } from "../../store/slices/user.slice";
import { useDispatch } from "react-redux";
import {useNavigate } from "react-router-dom";
import { AuthContext } from "../../context";

const Login = () => {
  const initialState = {
    phone: "",
    errorFields: [],
    password: "",
    loginError: "",
  };
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [userLogin] = useUserLoginMutation();
  const [state, setState] = useState(initialState);
  const [context, setContext] = useContext(AuthContext);
  const inputChangeHanlder = (event, id) => {
    setState((prev) => {
      return {
        ...prev,
        [id]: event.target.value,
      };
    });
  };

  const onError = ({ id, isError }) => {
    if (isError) {
      setState((prev) => ({
        ...prev,
        errorFields: _.uniq([...prev.errorFields, id]),
      }));
    } else {
      const newErrorFields = state.errorFields.filter((ele) => id != ele);
      setState((prev) => ({
        ...prev,
        errorFields: newErrorFields,
      }));
    }
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    const res = await userLogin({
      phoneNumber: state.phone,
      password: state.password,
    });
    if (res.error) {
      setState((prev) => {
        return {
          ...prev,
          loginError: res.error?.data?.error,
        };
      });
    }
    if (res.data?.user) {
      setState((prev) => {
        return {
          ...prev,
          loginError: "",
        };
      });
      dispatch(userActions.addUser(res.data.user));
      sessionStorage.setItem("userData", JSON.stringify(res.data.user));
      // storing auth token in session storage for testing
      sessionStorage.setItem("authToken", res.data.token);

      setContext(res.data.user);
      navigate("/authorised/dashboard");
    }
  };

  return (
    <div className={styles.loginPage}>
    <div className={styles.logincard}>
      <div className={styles.loginlogo}>
        <img src={logo} alt="Logo" />
      </div>
      <div className={styles.logotitle}>
        <span>Shree Krishna Nursery</span>
      </div>
      <div className={styles.inputlabel}>
        <div>
          <Input
            id="phone"
            type="number"
            errorMessage="Invalid Mobile Number"
            required
            validation={(number) => number.length === 10}
            value={state.phone}
            onChange={inputChangeHanlder}
            title="Phone Number"
            onError={onError}
          />
        </div>
        <div className={styles.label}>
          <Input
            id="password"
            value={state.password}
            type="password"
            errorMessage="Password should be 7 characters"
            onChange={inputChangeHanlder}
            required
            validation={(number) => number.length > 6}
            title="Password"
            onError={onError}
          />
        </div>
        <div className={styles.loginbtn}>
          <Button
            disabled={
              state.errorFields.length > 0 ||
              state.phone.length === 0 ||
              state.password.length === 0
            }
            type="primary"
            title="Login"
            onClick={onSubmitHandler}
          />
          <p style={{ color: "red" }}>{state.loginError}</p>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Login;
