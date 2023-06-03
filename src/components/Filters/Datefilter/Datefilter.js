import React, { useEffect, useState } from "react";
import "../DatePicker.css";
import "../Calendar.css";
import DatePicker from "react-date-picker";
import styles from "./Datefilter.module.css";
import MyDatePricker from "../../MyDatePicker/MyDatePicker";

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
      start_date: startDate,
      end_date: endDate,
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
          <p className={styles.inputTitle}>Start Date</p>
          {/* <DatePicker
            onChange={(e) => {
              setParentSet(false);
              setStartDate(e);
            }}
            value={startDate}
            maxDate={new Date()}
            dayPlaceholder="dd"
            monthPlaceholder="mm"
            yearPlaceholder="yyyy"
            calendarIcon={null}
            clearIcon={null}
            format="dd-MM-yyyy"
            className={styles.dateInput}
          /> */}
          <MyDatePricker
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
          <p className={styles.inputTitle}>End Date</p>
          {/* <DatePicker
            onChange={(e) => {
              setParentSet(false);
              setEndDate(e);
            }}
            value={endDate}
            maxDate={new Date()}
            dayPlaceholder="dd"
            monthPlaceholder="mm"
            yearPlaceholder="yyyy"
            calendarIcon={null}
            clearIcon={null}
            format="dd-MM-yyyy"
            minDate={startDate}
            className={styles.dateInput}
          /> */}
          <MyDatePricker
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
