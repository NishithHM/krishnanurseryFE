import React, { useState } from "react";
import styles from "./input.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEyeSlash, faEye } from "@fortawesome/free-solid-svg-icons";
import cx from "classnames";

const Input = (props) => {
  const {
    title,
    required,
    onChange,
    id,
    validation,
    value,
    errorMessage,
    onError,
    type,
  } = props;
  const [error, setError] = useState(false);
  const [show, setShow] = useState(false);
  const onInputBlur = () => {
    if (validation && !validation(value)) {
      setError(true);
      onError({ id, isError: true });
    } else if (onError) {
      setError(false);
      onError({ id, isError: false });
    }
  };

  const showPasswordHandler = () => {
    setShow(true);
    setTimeout(() => {
      setShow(false);
    }, 3000);
  };

  return (
    <div>
      <div className={styles.label}>
        <label>{title}</label>
        {required && (
          <span className={cx({ [`${styles.asterick}`]: required })}>*</span>
        )}
      </div>
      <div className={styles.inputDiv}>
        <input
          type={!show && type}
          value={value}
          onBlur={onInputBlur}
          onChange={(e) => onChange(e, id)}
          className={cx(styles.inputbox, { [`${styles.inputerror}`]: error })}
        />
        {type === "password"  && (
          <i className={styles.passwordIcon} onClick={showPasswordHandler}>
            <FontAwesomeIcon style={{color: "#539c64"}} icon={!show ? faEyeSlash : faEye} />
          </i>
        )}
      </div>
      {error && (
        <div className={styles.errortext}>
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};

export default Input;
