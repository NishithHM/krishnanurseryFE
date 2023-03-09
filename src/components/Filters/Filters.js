import React, { useEffect, useState } from "react";
import { FaFilter, FaChevronDown } from "react-icons/fa";

import styles from "./filters.module.css";
import Datefilter from "./Datefilter";
import Button from "../Button";

const Filters = ({ onSubmit = () => {}, onReset = () => {} }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmitFilter = (dates) => {
    onSubmit(dates);
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
            onSubmit={handleSubmitFilter}
            onReset={onReset}
            closeFilters={() => setIsOpen(false)}
          />
        </>
      )}
    </div>
  );
};

export default Filters;
