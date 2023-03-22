import React from "react";
import styles from "./alert.module.css";
import warning from "../../assets/images/warning.png";
import Button from "../Button";

const Alert = ({ handleConfirm, handleCancel, message }) => {
  return (
    <div className={styles.card}>
      <div className={styles.text}>
        <div className={styles.maintext}>
          <div>
            <img src={warning} alt="warning" />
          </div>
          <span>{message ? message : "Are you sure to delete access?"}</span>
        </div>
        <div clsasName={styles.subtext}>
          <span>
            <strong>Warning:</strong> This cannot be undone
          </span>
        </div>
        <div className={styles.button}>
          <div className={styles.buttonwidth}>
            <Button type="alert" title="Delete" onClick={handleConfirm} />
          </div>
          <div className={styles.buttonwidth}>
            <Button type="secondary" title="Cancel" onClick={handleCancel} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alert;
