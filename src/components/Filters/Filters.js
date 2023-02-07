import React, { useEffect, useState } from "react";
import { FaFilter, FaChevronDown } from "react-icons/fa";

import styles from "./filters.module.css";
import Datefilter from "./Datefilter";
import Button from "../Button";

const Filters = ({ onChange, onSubmit }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dates, setDates] = useState({ start_date: null, end_date: null });

  useEffect(() => {
    onChange(dates);
  }, [dates]);

  const onDateChangeHandler = (e) => {
    setDates(e);
  };

  const onDateSubmitHandler = (e) => {
    onSubmit(e);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.innerWrapper}>
        <h3 className={styles.title}>Filters</h3>
        <FaFilter />

        <div className={styles.controlBtn} onClick={() => setIsOpen((e) => !e)}>
          <FaChevronDown size={15} />
        </div>
      </div>
      {isOpen && (
        <>
          <Datefilter
            onChange={onDateChangeHandler}
            onSubmit={onDateSubmitHandler}
          />
        </>
      )}
    </div>
  );
};

export default Filters;
