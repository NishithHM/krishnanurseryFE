import React, { useContext } from "react";
import styles from "./dashboard.module.css";
import { toUpper } from "lodash";

import access_managementImg from "../../assets/images/dashboard/access_management.png";
import produrementImg from "../../assets/images/dashboard/procurement.png";
import categoriesImg from "../../assets/images/dashboard/categories.png";
import billsImg from "../../assets/images/dashboard/bills.png";
import salesImg from "../../assets/images/dashboard/sales.png";
import { Link, Route, Routes } from "react-router-dom";
import LandingTile from "../../components/LandingTile/landingTile";
import { AuthContext } from "../../context/AuthContext/authContext";
import { AccessManagement } from "./pages";

const Dashboard = () => {
  const userContext = useContext(AuthContext);

  console.log(userContext);
  const USER_ROLES = {
    admin: "ADMIN",
    procurement: "PROCUREMENT",
    sales: "SALES",
  };
  const DashboardData = [
    {
      title: "Access Management",
      tile_img: access_managementImg,
      path: "access-management",
      allowed: [USER_ROLES.admin],
    },
    {
      title: "Procurement",
      tile_img: produrementImg,
      path: "procurement",
      allowed: [USER_ROLES.admin],
    },
    {
      title: "Add Procurement",
      tile_img: produrementImg,
      path: "add-procurement",
      allowed: [USER_ROLES.procurement],
    },
    {
      title: "Procurement List",
      tile_img: billsImg,
      path: "procurement-list",
      allowed: [USER_ROLES.procurement],
    },
    {
      title: "Categories",
      tile_img: categoriesImg,
      path: "categories",
      allowed: [USER_ROLES.admin],
    },
    {
      title: "Bills",
      tile_img: billsImg,
      path: "bills",
      allowed: [USER_ROLES.admin],
    },
    {
      title: "Add Bills",
      tile_img: billsImg,
      path: "add-bills",
      allowed: [USER_ROLES.sales],
    },
    {
      title: "Sales",
      tile_img: salesImg,
      path: "sales",
      allowed: [USER_ROLES.admin],
      isDisabled: true
    },
  ];

  const getDashboardData = (role) => {
    return DashboardData.filter((data) => data.allowed.includes(role));
  };

  // const data = getDashboardData(toUpper(userContext[0].role));
  const data = getDashboardData(USER_ROLES.admin);
  return (
    <div className={styles.gridContainer}>
      {data.map((e) => (
        <Link to={e.path} key={e.path}>
          <LandingTile image={e.tile_img} title={e.title} isDisabled={e.isDisabled} />
          {/* <div className={styles.gridItem}>
            <img src={e.tile_img} alt="Image 1" />
            <div className={styles.title}>{e.title}</div>
          </div> */}
        </Link>
      ))}
    </div>
  );
};

export default Dashboard;
