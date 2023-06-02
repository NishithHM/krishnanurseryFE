import React from "react";
import styles from "./footer.module.css";
import SignWhiteBG from "../../assets/images/SignWhiteBG.png";
const Footer = () => {
  return (
    <div className={styles.footer}>
      <footer className={styles.footercontent}>
        <div className={styles.poweredBy}>
          <p><strong>Powered By</strong></p>
          <a
            href="https://www.codentechnologies.com"
            target="_blank"
            rel="noreferrer"
            style={{minWidth:'100px'}}
          >
            <img className={styles.image} height={24} src={SignWhiteBG} alt="coden-logo" />
          </a>
        </div>
        <div className={styles.content}>
          <a
            href="https://api.whatsapp.com/send?text=Hi, i would like to report an issue&phone=8277611667"
            className={styles.aboutcontent}
            target="_blank"
            rel="noreferrer"
          >
            <strong>Report an Issue</strong>
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
