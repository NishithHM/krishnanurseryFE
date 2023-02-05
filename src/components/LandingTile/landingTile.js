import React from "react";
import styles from "./landingTile.module.css";
import cx from 'classnames'
const LandingTile = (props) => {
const{image, title, isDisabled, onClick} = props
  return (
     <div  onClick={onClick} className={cx(styles.card, {[`${styles.disabled}`]: isDisabled})}>
      <div className={styles.image}>
        <img src={image} alt="Access Management" style={{width:'90%'}} />
      </div>
      <div className={styles.title}>
        <span>{title}</span>
      </div>
    </div> 
  );
};

export default LandingTile;
