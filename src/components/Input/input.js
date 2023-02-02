import React,{useState} from "react";
import styles from "./input.module.css"
import cx from 'classnames'

const Input = (props) => {
    const {title,required, onChange, id, validation, value, errorMessage, onError} = props
    const[error, setError] = useState(false)
    const onInputBlur = ()=>{
        if( validation && !validation(value)){
            setError(true)
            onError(id)
        }
    }

  return (
    <div>
      <div className={styles.label}>
        <label>{title}</label> 
        {required && <span className={cx({[`${styles.asterick}`]: required})}>*</span>}
      </div>
      <div>
      <input value={value} onBlur={onInputBlur} onChange={(e)=>onChange(e, id)} className={cx(styles.inputbox, {[`${styles.inputerror}`]: error})} type="text"/>
      </div>
      {error && <div className={styles.errortext}>
        <span>{errorMessage}</span>
      </div>}
    </div>
  );
};

export default Input;
