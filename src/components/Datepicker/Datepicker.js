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
      fontWeight: 400,
      color: "#302C2C",
      letterSpacing: "0.1rem",
    },
    input: {
      width: "10rem",
      fontWeight: 400,
      textAlign: "center",
      fontFamily: "Montserrat, sans-serif",
      color: "#302C2C",
    },

    ...parentStyle,
  };

  // const appliedStyles = parentStyle ? parentStyle : customStyles;

  return (
    <DatePicker
      label={label}
      placeholder="dd-mm-yyyy"
      inputFormat="DD-MM-YYYY"
      labelFormat="MMMM - YYYY"
      maxDate={maxDate ? maxDate : new Date()}
      size={size}
      withAsterisk={isRequired ? isRequired : false}
      styles={customStyles}
      value={value}
      onChange={onChange}
      minDate={minDate}
      clearable={clearable}
    />
  );
};

export default Datepicker;
