import React, { useContext, useState } from "react";
import styles from "./dashboard.module.css";
import { toUpper } from "lodash";

import access_managementImg from "../../assets/images/dashboard/access_management.png";
import produrementImg from "../../assets/images/dashboard/procurement.png";
import maintenanceImg from "../../assets/images/dashboard/maintenance.png";
import billBook from "../../assets/images/dashboard/billBook.png";
import categoriesImg from "../../assets/images/dashboard/categories.png";
import billsImg from "../../assets/images/dashboard/bills.png";
import salesImg from "../../assets/images/dashboard/sales.png";
import orders from "../../assets/images/dashboard/orders.png";
import waste from "../../assets/images/dashboard/wasteManagementIcon.png";
import paymentsIcon from "../../assets/images/dashboard/payments.png";
import { Link, Route, Routes } from "react-router-dom";
import LandingTile from "../../components/LandingTile/landingTile";
import { AuthContext } from "../../context/AuthContext/authContext";
import agriprocurements from "../../assets/images/dashboard/agriprocurements.png";

const Dashboard = () => {
  const [values] = useContext(AuthContext);
  const [selectedTab, setSelectedTab] = useState("Nursery");

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
      tabType: "Nursery",
    },
    {
      title: "Procurement",
      tile_img: produrementImg,
      path: "procurement-list",
      allowed: [USER_ROLES.admin, USER_ROLES.procurement],
      tabType: "Nursery",
    },
    {
      title: "Categories",
      tile_img: categoriesImg,
      path: "categories",
      allowed: [USER_ROLES.admin],
      tabType: "Nursery",
    },
    {
      title: "Bill History",
      tile_img: billBook,
      path: "bills",
      allowed: [USER_ROLES.admin, USER_ROLES.sales],
      tabType: "Nursery",
    },
    {
      title: "Add Bills",
      tile_img: billsImg,
      path: "add-bills",
      allowed: [USER_ROLES.sales, USER_ROLES.preSales],
      tabType: "Nursery",
    },

    {
      title: "Orders",
      tile_img: orders,
      path: "orders",
      allowed: [USER_ROLES.admin, USER_ROLES.procurement, USER_ROLES.sales],
      tabType: "Nursery",
    },
    {
      title: "Waste Management",
      tile_img: waste,
      path: "waste-management",
      allowed: [USER_ROLES.admin, USER_ROLES.sales],
      tabType: "Nursery",
    },
    {
      title: "Under Maintainence",
      tile_img: maintenanceImg,
      path: "under-maintainence",
      allowed: [USER_ROLES.sales, USER_ROLES.admin],
      tabType: "Nursery",
    },
    {
      title: "Payments",
      tile_img: paymentsIcon,
      path: "payments",
      allowed: [USER_ROLES.admin, USER_ROLES.sales, USER_ROLES.procurement],
      tabType: "Nursery",
    },
    {
      title: "Sales",
      tile_img: salesImg,
      path: "sales",
      allowed: [USER_ROLES.admin],
      isDisabled: true,
      tabType: "Nursery",
    },
    {
      title: "Agri Variants",
      tile_img: salesImg,
      path: "agri-variants",
      allowed: [USER_ROLES.admin, USER_ROLES.procurement],
      isDisabled: false,
      tabType: "Agri",
    },
    {
      title: "Bill History",
      tile_img: billBook,
      path: "agri-bills",
      allowed: [USER_ROLES.admin, USER_ROLES.sales],
      tabType : "Agri"
    },
    {
      title: "Agri Procurements",
      tile_img: produrementImg,
      path: "agri-add-procurements",
      allowed: [USER_ROLES.admin, USER_ROLES.procurement],
      isDisabled: false,
      tabType: "Agri",
    },
    {
      title: "Orders",
      tile_img: orders,
      path: "agri-orders",
      allowed: [USER_ROLES.procurement, USER_ROLES.sales, USER_ROLES.admin],
      tabType: "Agri",
    },

    {
      title: "Add Bills",
      tile_img: billsImg,
      path: "agri-add-bills",
      allowed: [USER_ROLES.preSales, USER_ROLES.sales],
      tabType: "Agri",
    },
  ];

  // /dashboard/orders-agri/request-order
  const getDashboardData = (role) => {
    return DashboardData.filter((data) => data.allowed.includes(role));
  };

  // const data = getDashboardData(toUpper(userContext[0].role));
  const data = getDashboardData(values.role);
  return (
    <div>
      <div className={styles.tabContainer}>
        <div style={{ width: "300px" }}>
          <div
            className={styles.tabItem}
            style={{ color: selectedTab === "Nursery" && "#008000" }}
            onClick={() => setSelectedTab("Nursery")}
          >
            Nursery
          </div>
          {selectedTab === "Nursery" && (
            <div className={styles.tabBottomBar}></div>
          )}
        </div>
        <div style={{ width: "300px" }}>
          <div
            style={{ color: selectedTab === "Agri" && "#008000" }}
            className={styles.tabItem}
            onClick={() => setSelectedTab("Agri")}
          >
            Agri
          </div>
          {selectedTab === "Agri" && (
            <div className={styles.tabBottomBar}></div>
          )}
        </div>
      </div>
      <div className={styles.gridContainer}>
        {data.map((e) => {
          if (e.tabType === selectedTab) {
            return (
              <div className={e.isDisabled && styles.cardDisabled}>
                <Link to={e.path} key={e.path}>
                  <LandingTile
                    image={e.tile_img}
                    title={e.title}
                    isDisabled={e.isDisabled}
                  />
                </Link>
              </div>
            );
          } else {
            return [];
          }
        })}
      </div>
    </div>
  );
};

export default Dashboard;
