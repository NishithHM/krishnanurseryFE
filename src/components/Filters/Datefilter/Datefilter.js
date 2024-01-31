import React, { useEffect, useState } from "react";
import "../Calendar.css";
import styles from "./Datefilter.module.css";
import Datepicker from "../../Datepicker/Datepicker";

const Datefilter = ({
  onChange = () => {},
  onSubmit,
  startDateInput,
  endDateInput,
  onReset,
}) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isParentSet, setParentSet] = useState(false);
  useEffect(() => {
    setStartDate(startDateInput);
    setEndDate(endDateInput);
    setParentSet(true);
  }, [startDateInput, endDateInput]);

  useEffect(() => {
    onChangeHandler();
  }, [startDate, endDate]);

  const onChangeHandler = () => {
    const data = {
      startDate: startDate,
      endDate: endDate,
    };
    if (!isParentSet) {
      onChange(data);
    }
  };

  const datePickerStyles = {
    input: {
      background: "#edecea",
      width: "110px",
      fontSize: "15px",
      fontWeight: 400,
      padding: 0,
      textAlign: "center",
      fontFamily: "Montserrat, sans-serif",
    },
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.innerWrapper}>
        <div>
          <span className={styles.inputTitle}>Start Date</span>

          <Datepicker
            onChange={(e) => {
              setParentSet(false);
              setStartDate(e);
            }}
            size="xs"
            value={startDate}
            maxDate={new Date()}
            styles={datePickerStyles}
            clearable={false}
          
          />
        </div>

        <div>
          <span className={styles.inputTitle}>End Date</span>
          <Datepicker
            onChange={(e) => {
              setParentSet(false);
              setEndDate(e);
            }}
            size="xs"
            value={endDate}
            maxDate={new Date()}
            styles={datePickerStyles}
            minDate={startDate}
            clearable={false}
          />
        </div>
      </div>
    </div>
  );
};

export default Datefilter;
