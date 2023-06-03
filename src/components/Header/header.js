import React, { useContext } from "react";
import logo from "../../assets/images/logo.png";
// import Logo from "../Logo";
import styles from "./header.module.css";
import logout from "../../assets/images/logout.png";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context";
import {useLocation} from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setContext] = useContext(AuthContext);

  const onLogoClick = () => {
    // navigate("/authorised/dashboard")
  };
  const onLogoutHandler = () => {
    sessionStorage.clear();
    setContext({});
    navigate("/");
  };
  return (
    <div className={styles.header}>
      <header className={styles.headercontent}>
        <div className={styles.logo}>
          <div className={styles.logoclick}>
            <img className={styles.logoHeader} src={logo} alt="Logo" />
          </div>
        </div>
        {location.pathname!=='/customer-onboarding' && <div className={styles.logout}>
          <img onClick={onLogoutHandler} src={logout} alt="Logout" />
         <div>
            <span className={styles.userId}>{`Hello ${user.name}`} </span>
          </div>
        </div>}
      </header>
    </div>
  );
};

export default Header;
