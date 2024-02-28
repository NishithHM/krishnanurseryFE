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
  id,
  defaultStartDate,
  defaultEndDate
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

  const handleChange = (date) => {
  var dates = new Date(date);

  var year = dates.getFullYear();
  var month = dates.getMonth() + 1; 
  var day = dates.getDate();

  var formattedDate = year + "-" + (month < 10 ? "0" + month : month) + "-" + (day < 10 ? "0" + day : day);

  onChange(formattedDate);
};

  return (
    <DatePicker
      label={label}
      placeholder={id === "startDate" ? defaultStartDate : defaultEndDate }
      inputFormat="DD-MM-YYYY"
      labelFormat="MMMM - YYYY"
      maxDate={maxDate}
      size={size}
      withAsterisk={isRequired ? isRequired : false}
      styles={appliedStyles}
      value={value}
      onChange={handleChange} 
      minDate={minDate}
      clearable={clearable}
      disabled={disabled}
    />
  );
};

export default Datepicker;
