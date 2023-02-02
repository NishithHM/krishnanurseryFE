import React from "react";
import cx from 'classnames'
import styles from "./button.module.css"

const Button = ({type, onClick, title})=>{
    return(
        <div>
            <div onClick={onClick} className={cx(styles.button, {
                [`${styles.primary}`] : type==="primary",
                [`${styles.alert}`] : type==="alert",
                [`${styles.secondary}`] : type==="secondary"
            })}><span className={styles.text}>{title}</span>
            </div>
        </div>
    )
}

export default Button