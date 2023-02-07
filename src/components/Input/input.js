import React, { useState } from "react";
import styles from "./input.module.css";
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
  const onInputBlur = () => {
    if (validation && !validation(value)) {
      setError(true);
      onError({id, isError: true});
    } else if(onError){
      setError(false)
      onError({id, isError: false});
    }
  };

  return (
    <div>
      <div className={styles.label}>
        <label>{title}</label>
        {required && (
          <span className={cx({ [`${styles.asterick}`]: required })}>*</span>
        )}
      </div>
      <div>
        <input
          type={type}
          value={value}
          onBlur={onInputBlur}
          onChange={(e) => onChange(e, id)}
          className={cx(styles.inputbox, { [`${styles.inputerror}`]: error })}
        />
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
