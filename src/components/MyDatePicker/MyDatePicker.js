import { DatePicker } from "@mantine/dates";
import React from "react";
import styles from "./MyDatePicker.module.css";

const MyDatePricker = (props) => {
  const {
    label,
    maxDate,
    size,
    withAsterisk,
    value,
    onChange,
    styles,
    minDate,
    clearable,
  } = props;

  return (
    <div>
      <DatePicker
        label={label}
        placeholder="dd-mm-yyyy"
        inputFormat="DD-MM-YYYY"
        labelFormat="MMMM - YYYY"
        maxDate={maxDate}
        size={size}
        withAsterisk={withAsterisk}
        styles={styles}
        value={value}
        onChange={onChange}
        minDate={minDate}
        clearable={clearable}
      />
    </div>
  );
};

export default MyDatePricker;
