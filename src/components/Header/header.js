import React, { useContext } from "react";
import logo from "../../assets/images/logo.png"
// import Logo from "../Logo";
import styles from "./header.module.css"
import logout from "../../assets/images/logout.png"
import {useNavigate} from "react-router-dom"
import { AuthContext } from "../../context";

const Header = () => {
  const navigate = useNavigate()
  const [context,setContext] = useContext(AuthContext);

  const onLogoClick = ()=>{
    navigate("/authorised/dashboard")
  }
  const onLogoutHandler = ()=>{
    sessionStorage.clear()
    setContext({})
    navigate("/")
  }
  return (
    <div className={styles.header}>
      <header className={styles.headercontent}>
        <div className={styles.logo}>
          <div className={styles.logoclick} onClick={onLogoClick}>
            <img height={100} src={logo} alt="Logo"/>
            </div>
            <div className={styles.headertitle}>
            <span className={styles.title}>Shree Krishna Farm & Nursery</span>
            </div>
        </div>
        <div className={styles.logout}>
            <img onClick={onLogoutHandler} src={logout} alt="Logout"/>
        </div>
      </header>
    </div>
  );
};

export default Header;
