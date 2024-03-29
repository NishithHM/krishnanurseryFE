import React from "react";
import styles from "./alert.module.css";
import warning from "../../assets/images/warning.png";
import Button from "../Button";

const Alert = ({
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
          <div>
            <img src={warning} alt="warning" />
          </div>
          <span>{message ? message : "Are you sure to delete access?"}</span>
        </div>
        <div className={styles.subtext}>
          <span>
            {subMessage ? (
              subMessage
            ) : (
              <>
                <strong>Warning:</strong> This cannot be undone
              </>
            )}
          </span>
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

export default Alert;
