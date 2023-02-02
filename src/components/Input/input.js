import React from "react";
import styles from "./input.module.css"
import cx from 'classnames'

const Input = (props) => {
    const {title,required, onChange, id} = props
  return (
    <div>
      <div className={styles.label}>
        <label>{title}</label> 
        {required && <span className={cx({[`${styles.asterick}`]: required})}>*</span>}
      </div>
      <div>
      <input onChange={(e)=>onChange(e, id)} className={styles.inputbox} type="text"/>
      </div>
    </div>
  );
};

export default Input;
