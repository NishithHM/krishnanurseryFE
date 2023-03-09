import React, { useEffect, useState } from "react";
import DatePicker from "react-date-picker";
import Button from "../../Button";
import styles from "./Datefilter.module.css";

const Datefilter = ({ onSubmit, onReset, closeFilters }) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const formatDate = (date) => {
    let today = new Date(date);
    let yyyy = today.getFullYear();
    let mm = today.getMonth() + 1;
    let dd = today.getDate();

    if (mm < 10) {
      mm = `0${mm}`;
    }

    if (dd < 10) {
      dd = `0${dd}`;
    }
    let formatted = `${yyyy}-${mm}-${dd}`;
    return formatted;
  };
  const onSubmitHandler = () => {
    const data = {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
    };

    onSubmit(data);
  };

  const onResetHandler = () => {
    onReset();
    closeFilters();
    setStartDate(null);
    setEndDate(null);
  };
  return (
    <div className={styles.wrapper}>
      <div className={styles.innerWrapper}>
        <div>
          <p className={styles.inputTitle}>Start Date</p>
          <DatePicker
            onChange={(e) => {
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
        <Button
          title="Submit"
          onClick={onSubmitHandler}
          disabled={!startDate || !endDate}
        />
        {startDate && endDate && (
          <Button
            title="Reset"
            type="alert"
            onClick={onResetHandler}
            disabled={!startDate || !endDate}
          />
        )}
      </div>
    </div>
  );
};

export default Datefilter;
