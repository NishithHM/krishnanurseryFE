import React from "react";
import cx from 'classnames'
import styles from "./button.module.css"

const Button = ({type, onClick, title, disabled})=>{
    return(
        <div>
            <div onClick={!disabled ? onClick : null} className={cx(styles.button, {
                [`${styles.primary}`] : type==="primary",
                [`${styles.alert}`] : type==="alert",
                [`${styles.secondary}`] : type==="secondary",
                [`${styles.disabled}`] : disabled
            })}><span className={styles.text}>{title}</span>
            </div>
        </div>
    )
}

export default Button