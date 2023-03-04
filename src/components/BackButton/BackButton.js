import React from "react";
import { FaArrowLeft } from "react-icons/fa";
import styles from "./BackButton.module.css";
import { useNavigate } from "react-router-dom";

const BackButton = ({navigateTo}) => {
  const navigate = useNavigate();

  const onNavigate = ()=>{
    navigate(navigateTo)
  }
  return (
    <div className={styles.backButton}>
      <FaArrowLeft onClick={onNavigate}/>
    </div>
  );
};

export default BackButton;
