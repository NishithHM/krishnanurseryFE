import React from "react";
import styles from "./alert.module.css";
import warning from "../../assets/images/warning.png";
import Button from "../Button";

const Alert = () => {
  return (
    <div className={styles.card}>
      <div className={styles.text}>
        <div className={styles.maintext}>
          <div>
            <img src={warning} alt="warning" />
          </div>
          <span>Are you sure to delete access?</span>
        </div>
        <div className={styles.subtext}>
          <span>Warning: This cannot be undone</span>
        </div>
        <div className={styles.button}>
          <div className={styles.buttonwidth}>
            <Button type="alert" title="Delete"/>
          </div>
          <div className={styles.buttonwidth}>
            <Button type="secondary" title="Cancel"/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alert;
