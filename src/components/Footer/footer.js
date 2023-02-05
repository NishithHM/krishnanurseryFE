import React from "react";
import styles from "./footer.module.css"

const Footer = ()=>{
    return(
        <div className={styles.footer}>
            <footer className={styles.footercontent}>
                <div className={styles.copyright}>
                    Copyright © 2023
                </div>
                <div className={styles.content}>
                    <span className={styles.aboutcontent}>
                        About Us
                    </span>
                    <span className={styles.aboutcontent}>
                    Terms And Conditions
                    </span>
                    <span className={styles.aboutcontent}>
                    Privacy Policy
                    </span>
                    <span className={styles.aboutcontent}>
                    Contact Us
                    </span>
                </div>
            </footer>
        </div>
    )
}

export default Footer