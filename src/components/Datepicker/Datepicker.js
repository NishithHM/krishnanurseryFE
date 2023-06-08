import { DatePicker } from "@mantine/dates";
import React from "react";

const Datepicker = ({
  label,
  maxDate,
  size,
  isRequired,
  value,
  onChange,
  styles: parentStyle,
  minDate,
  clearable,
  disabled,
}) => {
  const customStyles = {
    label: {
      fontSize: "20px",
      marginBottom: "2px",
      fontFamily: "Montserrat, sans-serif",
    },
    input: {
      border: "none",
      borderBottom: "1.5px solid black",
      borderRadius: 0,
      fontSize: "16px",
      fontWeight: 400,
      color: "#302C2C",
      fontFamily: "Montserrat, sans-serif",
      backgroundColor: `${disabled && "#edeceb"}`,
    },
  };

  const appliedStyles = parentStyle ? parentStyle : customStyles;

  return (
    <DatePicker
      label={label}
      placeholder="dd-mm-yyyy"
      inputFormat="DD-MM-YYYY"
      labelFormat="MMMM - YYYY"
      maxDate={maxDate}
      size={size}
      withAsterisk={isRequired ? isRequired : false}
      styles={appliedStyles}
      value={value}
      onChange={onChange}
      minDate={minDate}
      clearable={clearable}
      disabled={disabled}
    />
  );
};

export default Datepicker;
