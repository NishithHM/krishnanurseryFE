import React, { useContext, useEffect, useState } from "react";
import styles from "./dashboard.module.css";

import access_managementImg from "../../assets/images/dashboard/access_management.png";
import produrementImg from "../../assets/images/dashboard/procurement.png";
import maintenanceImg from "../../assets/images/dashboard/maintenance.png";
import billBook from "../../assets/images/dashboard/billBook.png";
import categoriesImg from "../../assets/images/dashboard/categories.png";
import billsImg from "../../assets/images/dashboard/bills.png";
import salesImg from "../../assets/images/dashboard/sales.png";
import agriVariantsImg from "../../assets/images/dashboard/agri_variants.jpeg";
import vendorImg from "../../assets/images/dashboard/vendor.png";
import orders from "../../assets/images/dashboard/orders.png";
import waste from "../../assets/images/dashboard/wasteManagementIcon.png";
import paymentsIcon from "../../assets/images/dashboard/payments.png";
import { Link,useLocation } from "react-router-dom";
import LandingTile from "../../components/LandingTile/landingTile";
import { AuthContext } from "../../context/AuthContext/authContext";

const Dashboard = () => {
  const [values] = useContext(AuthContext);
  const [selectedTab, setSelectedTab] = useState("Nursery");

  const USER_ROLES = {
    admin: "admin",
    procurement: "procurement",
    sales: "sales",
    preSales: "preSales",
  };
  const DashboardData = [
    {
      id : 1,
      title: "Access Management",
      tile_img: access_managementImg,
      path: "access-management",
      allowed: [USER_ROLES.admin],
      tabType: "Nursery",
    },
    {
      id : 2,
      title: "Procurement",
      tile_img: produrementImg,
      path: "procurement-list",
      allowed: [USER_ROLES.admin, USER_ROLES.procurement],
      tabType: "Nursery",
    },
    {
      id : 3,
      title: "Categories",
      tile_img: categoriesImg,
      path: "categories",
      allowed: [USER_ROLES.admin],
      tabType: "Nursery",
    },
    {
      id : 4,
      title: "Bill History",
      tile_img: billBook,
      path: "bills",
      allowed: [USER_ROLES.admin, USER_ROLES.sales],
      tabType: "Nursery",
    },
    {
      id : 5,
      title: "Add Bills",
      tile_img: billsImg,
      path: "add-bills",
      allowed: [USER_ROLES.sales, USER_ROLES.preSales],
      tabType: "Nursery",
    },

    {
      id : 6,
      title: "Orders",
      tile_img: orders,
      path: "orders",
      allowed: [USER_ROLES.admin, USER_ROLES.procurement, USER_ROLES.sales],
      tabType: "Nursery",
    },
    {
      id : 7,
      title: "Waste Management",
      tile_img: waste,
      path: "waste-management",
      allowed: [USER_ROLES.admin, USER_ROLES.sales,USER_ROLES.procurement],
      tabType: "Nursery",
    },
    {
      id : 8,
      title: "Under Maintenance",
      tile_img: maintenanceImg,
      path: "under-maintainence",
      allowed: [USER_ROLES.sales, USER_ROLES.admin],
      tabType: "Nursery",
    },
    {
      id : 9,
      title: "Payments",
      tile_img: paymentsIcon,
      path: "payments",
      allowed: [USER_ROLES.admin, USER_ROLES.sales, USER_ROLES.procurement],
      tabType: "Nursery",
    },
    {
      id : 10,
      title: "Sales",
      tile_img: salesImg,
      path: "sales",
      allowed: [USER_ROLES.admin],
      isDisabled: false,
      tabType: "Nursery",
    },
    {
      id : 11,
      title: "Procurement",
      tile_img: produrementImg,
      path: "agri-add-procurements",
      allowed: [USER_ROLES.admin, USER_ROLES.procurement],
      isDisabled: false,
      tabType: "Agri",
    },
    {
      id : 12,
      title: "Orders",
      tile_img: orders,
      path: "agri-orders",
      allowed: [USER_ROLES.procurement, USER_ROLES.sales, USER_ROLES.admin],
      tabType: "Agri",
    },
    {
      id : 13,
      title: "Bill History",
      tile_img: billBook,
      path: "agri-bills",
      allowed: [USER_ROLES.admin, USER_ROLES.sales],
      tabType: "Agri"
    },
    {
      id : 14,
      title: "Add Bills",
      tile_img: billsImg,
      path: "agri-add-bills",
      allowed: [USER_ROLES.preSales, USER_ROLES.sales],
      tabType: "Agri",
    },
    {
      id : 15,
      title: "Agri Variants",
      tile_img: agriVariantsImg,
      path: "agri-variants",
      allowed: [USER_ROLES.admin, USER_ROLES.procurement],
      isDisabled: false,
      tabType: "Agri",
    },
    {
      id : 16,
      title: "Vendor",
      tile_img: vendorImg,
      path: "vendors",
      allowed: [USER_ROLES.admin, USER_ROLES.procurement],
      isDisabled: false,
      tabType: "Nursery",
    },
    {
      id: 17,
      title: "Agri Payments",
      tile_img: paymentsIcon,
      path: "agri-payments",
      allowed: [USER_ROLES.admin, USER_ROLES.procurement, USER_ROLES.sales],
      isDisabled: false,
      tabType: "Agri",
    },
  ];

  const { state } = useLocation()
  useEffect(() => {
    if (state !== null && state.tabType !== undefined) {
      setSelectedTab("Agri")
    }
  }, [state])

  // /dashboard/orders-agri/request-order
  const getDashboardData = (role) => {
    return DashboardData.filter((data) => data.allowed.includes(role) && data.tabType === selectedTab);
  };

  // const data = getDashboardData(toUpper(userContext[0].role));
  const data = getDashboardData(values.role);
  if (selectedTab === "Agri" && values.role === "sales") {
    const first = data.shift()
    data.push(first)
  }
  return (
    <div>
      <div className={styles.tabContainer}>
        <div style={{ width: "300px" }}>
          <div
            className={styles.tabItem}
            style={{ color: selectedTab === "Nursery" && "#038819" }}
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
            style={{ color: selectedTab === "Agri" && "#038819" }}
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
          return (
            <div className={e.isDisabled && styles.cardDisabled} key={e?.id}>
              <Link to={e.path} key={e.path}>
                <LandingTile
                  image={e.tile_img}
                  title={e.title}
                  isDisabled={e.isDisabled}
                />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
