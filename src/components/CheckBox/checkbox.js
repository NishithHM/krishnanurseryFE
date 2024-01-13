
import React from 'react';
import styles from './checkbox.module.css'
const Checkbox = ({ id, onChange, label, value }) => {
  const handleCheckboxChange = (event) => {
    onChange(event.target.checked, id);
  };

  return (
    <div>
      <label htmlFor={id} className={styles.checkboxLabel}>
        <input
          type="checkbox"
          id={id}
          checked={value}
          onChange={handleCheckboxChange}
        />
        {label}
      </label>
    </div>
  );
};

export default Checkbox;