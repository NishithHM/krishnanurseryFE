import React from "react";
import styles from "./toggle.module.css"; // using the same CSS file

const ToggleSwitch = ({checked, onChange = () => {},  label }) => {
  const handleChange = (event) => {
    onChange(event.target.checked);
  };

  return (
    <label className={styles.toggleSwitch}>
      <input
        type="checkbox"
        checked={checked}
        onChange={handleChange}
      />
      <span className={styles.slider}></span>
      <span className={styles.labelText}>{label}</span>
    </label>
  );
};

export default ToggleSwitch;
