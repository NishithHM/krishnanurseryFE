import React from "react";
import { BiArrowBack } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import styles from "./BackNavigation.module.css";
const BackNavigation = () => {
  const navigate = useNavigate();

  return (
    <div>
      <div className={styles.bar} onClick={() => navigate(-1)}>
        <BiArrowBack size={30} />
        <p className={styles.text}>Back</p>
      </div>
    </div>
  );
};

export default BackNavigation;
