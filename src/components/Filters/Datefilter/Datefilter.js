import React, { useEffect, useState } from "react";
import "../DatePicker.css";
import "../Calendar.css";
import DatePicker from "react-date-picker";
import Button from "../../Button";
import styles from "./Datefilter.module.css";

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

  const onSubmitHandler = () => {
    const data = {
      start_date: startDate,
      end_date: endDate,
    };

    onSubmit(data);
  };

  const onResetHandler = () => {
    const data = {
      start_date: startDate,
      end_date: endDate,
    };
    onReset(data);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.innerWrapper}>
        <div>
          <p className={styles.inputTitle}>Start Date</p>
          <DatePicker
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
          />
        </div>

        <div>
          <p className={styles.inputTitle}>End Date</p>
          <DatePicker
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
          />
        </div>
      </div>

      <div className={styles.buttonWrapper}>
        <div className={styles.btnSubWrapper}>
          <Button
            title="Submit"
            onClick={onSubmitHandler}
            disabled={!startDate || !endDate}
          />
        </div>
      </div>
    </div>
  );
};

export default Datefilter;
