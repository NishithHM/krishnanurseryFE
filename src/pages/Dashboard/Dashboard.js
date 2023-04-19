import React, { useContext } from "react";
import styles from "./dashboard.module.css";
import { toUpper } from "lodash";

import access_managementImg from "../../assets/images/dashboard/access_management.png";
import produrementImg from "../../assets/images/dashboard/procurement.png";
import categoriesImg from "../../assets/images/dashboard/categories.png";
import billsImg from "../../assets/images/dashboard/bills.png";
import salesImg from "../../assets/images/dashboard/sales.png";
import orders from "../../assets/images/dashboard/orders.png";
import { Link, Route, Routes } from "react-router-dom";
import LandingTile from "../../components/LandingTile/landingTile";
import { AuthContext } from "../../context/AuthContext/authContext";

const Dashboard = () => {
  const [values] = useContext(AuthContext);

  // console.log(values);
  const USER_ROLES = {
    admin: "admin",
    procurement: "procurement",
    sales: "sales",
    preSales: "preSales",
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
      path: "procurement-list",
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
      allowed: [USER_ROLES.admin, USER_ROLES.sales],
    },
    {
      title: "Add Bills",
      tile_img: billsImg,
      path: "add-bills",
      allowed: [USER_ROLES.sales, USER_ROLES.preSales],
    },
    {
      title: "Sales",
      tile_img: salesImg,
      path: "sales",
      allowed: [USER_ROLES.admin],
      isDisabled: true,
    },
    {
        title: "Orders",
        tile_img: orders,
        path: "orders",
        allowed: [USER_ROLES.admin, USER_ROLES.procurement, USER_ROLES.sales],
      },
  ];

  const getDashboardData = (role) => {
    return DashboardData.filter((data) => data.allowed.includes(role));
  };

  // const data = getDashboardData(toUpper(userContext[0].role));
  const data = getDashboardData(values.role);
  return (
    <div className={styles.gridContainer}>
      {data.map((e) => (
        <div className={e.isDisabled && styles.cardDisabled}>
          <Link to={e.path} key={e.path}>
            <LandingTile
              image={e.tile_img}
              title={e.title}
              isDisabled={e.isDisabled}
            />
          </Link>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
