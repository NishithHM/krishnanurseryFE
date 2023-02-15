import React from "react";
import cx from "classnames";
import styles from "./button.module.css";
import { Loader } from "@mantine/core";

const Button = ({
  type = "primary",
  onClick,
  title,
  disabled,
  buttonType = "button",
  small = false,
  loading = false,
}) => {
  return (
    // <div>
    //     <div onClick={!disabled ? onClick : null} className={cx(styles.button, {
    //         [`${styles.primary}`] : type==="primary",
    //         [`${styles.alert}`] : type==="alert",
    //         [`${styles.secondary}`] : type==="secondary",
    //         [`${styles.disabled}`] : disabled
    //     })}><span className={styles.text}>{title}</span>
    //     </div>
    // </div>

    <button
      type={buttonType}
      onClick={onClick}
      className={cx(styles.button, {
        [`${styles.primary}`]: type === "primary",
        [`${styles.alert}`]: type === "alert",
        [`${styles.secondary}`]: type === "secondary",
        [`${styles.disabled}`]: disabled,
      })}
      disabled={disabled || loading}
    >
      <span className={styles.text}>{title}</span>
      {loading && <Loader color="green" size={22} />}
    </button>
  );
};

export default Button;
