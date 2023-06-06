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
}) => {
  const customStyles = {
    label: {
      fontStyle: "'Montserrat', sans-serif",
      fontSize: "1.1rem",
      fontWeight: 400,
      color: "#302C2C",
      letterSpacing: "0.1rem",
    },
    input: {
      width: "10rem",
      fontSize: "1.1rem",
      fontWeight: 400,
      textAlign: "center",
      fontFamily: "Montserrat, sans-serif",
    },
  };

  const appliedStyles = parentStyle ? parentStyle : customStyles;

  return (
    <DatePicker
      label={label}
      placeholder="dd-mm-yyyy"
      inputFormat="DD-MM-YYYY"
      labelFormat="MMMM - YYYY"
      maxDate={maxDate ? maxDate : new Date()}
      size={size}
      withAsterisk={isRequired ? isRequired : false}
      styles={appliedStyles}
      value={value}
      onChange={onChange}
      minDate={minDate}
      clearable={clearable}
    />
  );
};

export default Datepicker;
