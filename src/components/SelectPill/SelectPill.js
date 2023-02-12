import React, { useEffect, useState } from "react";
import styles from "./SelectPill.module.css";

const SelectPill = ({ options = [], onChange }) => {
  const [selectedOptions, setSelectedOptions] = useState([]);

  useEffect(() => {
    onChange(selectedOptions);
  }, [selectedOptions]);

  const handleChange = (option) => {
    const selectedOptionIndex = selectedOptions.indexOf(option);
    if (selectedOptionIndex === -1) {
      setSelectedOptions([...selectedOptions, option]);
    } else {
      setSelectedOptions(
        selectedOptions.filter((_, index) => index !== selectedOptionIndex)
      );
    }
  };

  return (
    <div className={styles.pillTabsGroup}>
      {options.map((option) => (
        <div
          className={`${styles.pillTab} ${
            selectedOptions.includes(option) ? styles.selected : ""
          }`}
          key={option}
          onClick={() => handleChange(option)}
        >
          {option}
        </div>
      ))}
    </div>
  );
};

export default SelectPill;
