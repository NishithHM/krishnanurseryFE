import React from "react";
import logo from "../../assets/images/logo.png"
// import Logo from "../Logo";
import styles from "./header.module.css"
import logout from "../../assets/images/logout.png"

const Header = () => {
  return (
    <div className={styles.header}>
      <header className={styles.headercontent}>
        <div className={styles.logo}>
          <div>
            <img src={logo} alt="Logo"/>
            </div>
            <div className={styles.headertitle}>
            <span className={styles.title}>Krishna Nursery</span>
            </div>
        </div>
        <div className={styles.logout}>
            <img src={logout} alt="Logout"/>
        </div>
      </header>
    </div>
  );
};

export default Header;
