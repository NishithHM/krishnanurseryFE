import React, { useEffect, useState } from "react";
import DatePicker from "react-date-picker";
import Button from "../../Button";
import styles from "./Datefilter.module.css";

const Datefilter = ({ onChange, onSubmit }) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    onChangeHandler();
  }, [startDate, endDate]);

  const onChangeHandler = () => {
    const data = {
      start_date: startDate,
      end_date: endDate,
    };

    onChange(data);
  };

  const onSubmitHandler = () => {
    const data = {
      start_date: startDate,
      end_date: endDate,
    };

    onSubmit(data);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.innerWrapper}>
        <div>
          <p className={styles.inputTitle}>Start Date</p>
          <DatePicker
            onChange={(e) => {
              console.log(e);
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
            onChange={(e) => setEndDate(e)}
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
        <Button
          title="Submit"
          onClick={onSubmitHandler}
          disabled={!startDate || !endDate}
        />
      </div>
    </div>
  );
};

export default Datefilter;
