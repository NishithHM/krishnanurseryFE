import React from "react";
import styles from "./alert.module.css";
import warning from "../../assets/images/warning.png";
import Button from "../Button";

const AlertMessage = ({
  handleConfirm,
  handleCancel,
  message,
  subMessage,
  confirmBtnType,
  confirmBtnLabel,
  cancelBtnLabel,
  cancelLoading,
  successLoading,
  children,
}) => {
  return (
    <div className={styles.card}>
      <div className={styles.text}>
        <div className={styles.maintext}>
          <span>{message || ""}</span>
        </div>

        {children}
        <div className={styles.button}>
          <div className={styles.buttonwidth}>
            <Button
              type={confirmBtnType ? confirmBtnType : "alert"}
              title={confirmBtnLabel ? confirmBtnLabel : "Delete"}
              onClick={handleConfirm}
              disabled={cancelLoading || false}
              loading={successLoading || false}
            />
          </div>
          <div className={styles.buttonwidth}>
            <Button
              type="secondary"
              title={cancelBtnLabel ? cancelBtnLabel : "Delete"}
              onClick={handleCancel}
              loading={cancelLoading || false}
              disabled={successLoading || false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertMessage;
