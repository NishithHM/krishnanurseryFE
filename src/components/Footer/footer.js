import React from "react";
import styles from "./footer.module.css";
import codenlogo from "../../assets/images/coden-logo.png";
const Footer = () => {
  return (
    <div className={styles.footer}>
      <footer className={styles.footercontent}>
        <div className={styles.poweredBy}>
          <p>Powered By</p>
          <a
            href="https://www.codentechnologies.com"
            target="_blank"
            rel="noreferrer"
          >
            <img src={codenlogo} alt="coden-logo" />
          </a>
        </div>
        <div className={styles.content}>
          <a
            href="https://api.whatsapp.com/send?text=Hi, i would like to report an issue&phone=8277611667"
            className={styles.aboutcontent}
            target="_blank"
            rel="noreferrer"
          >
            Report an Issue
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
