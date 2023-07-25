import React, { useContext, useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context";
import {
  AccessManagement,
  AddProcurement,
  Categories,
  Dashboard,
  Employee,
  ProcurementList,
  Test,
  AddBills,
  Bills,
  PlaceOrder,
  RequestOrder,
  OrderManagement,
  WasteManagement,
  UnderMaintainence,
  Payments,
  AgriVariants,
  AddNewVariants,
  AgriProcurement,
  AgriRequesrOrder,
  AgriOrderMgmt,
  AgriAddBills,
} from "../../pages";
import { isEmpty } from "lodash";
import { Footer, Header } from "../../components";
import WasteList from "../../pages/WasteManagement/WasteManagementList";

const Protected = () => {
  const [context, setContext] = useContext(AuthContext);
  const [isAuthorised, setAuthorised] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    if (!isEmpty(context)) {
      setAuthorised(true);
    } else {
      setAuthorised(false);
      navigate("/");
    }
  }, [context]);
  if (isAuthorised) {
    return (
      <>
        <Header />
        <div
          style={{
            minHeight: "70vh",
            width: "100%",
            // maxWidth: "1400px",
            margin: "auto",
          }}
        >
          <Routes>
            <Route path="/components" exact element={<Test />} />
            <Route path="/dashboard" exact element={<Dashboard />} />
            <Route path="/add-employee" exact element={<Employee />} />
            <Route
              path="/dashboard/access-management"
              exact
              element={<AccessManagement />}
            />
            <Route
              path="/dashboard/orders"
              exact
              element={<OrderManagement />}
            />
            {/* <Route
              path="/dashboard/add-procurement"
              exact
              element={<AddProcurement />}
            /> */}
            <Route
              path="/dashboard/procurement-list"
              exact
              element={<ProcurementList />}
            />
            <Route path="/dashboard/bills" exact element={<Bills type="NURSERY" />} />
            <Route path="/dashboard/agri-bills" exact element={<Bills type="AGRI" />} />
            <Route path="/dashboard/add-bills" exact element={<AddBills />} />
            <Route
              path="/dashboard/categories"
              exact
              element={<Categories />}
            />
            <Route
              path="/dashboard/orders/place-order"
              exact
              element={<PlaceOrder />}
            />
            <Route
              path="/dashboard/orders/request-order"
              exact
              element={<RequestOrder />}
            />
            <Route
              path="/dashboard/waste-management/add"
              exact
              element={<WasteManagement />}
            />
            <Route
              path="/dashboard/under-maintainence"
              exact
              element={<UnderMaintainence />}
            />
            <Route
              path="/dashboard/waste-management"
              exact
              element={<WasteList />}
            />
            <Route path="/dashboard/payments" exact element={<Payments />} />
            <Route
              path="/dashboard/agri-variants"
              exact
              element={<AgriVariants />}
            />
            <Route
              path="/dashboard/agri-add-variants"
              exact
              element={<AddNewVariants />}
            />
            <Route
              path="/dashboard/orders-agri/request-order"
              exact
              element={<AgriRequesrOrder />}
            />
            <Route
              path="/dashboard/agri-orders"
              exact
              element={<AgriOrderMgmt />}
            />
            <Route
              path="/dashboard/agri-add-procurements"
              exact
              element={<AgriProcurement />}
            />
            <Route
              path="/dashboard/agri-add-bills"
              exact
              element={<AgriAddBills />}
            />
          </Routes>
        </div>
        <Footer />
      </>
    );
  }
};

export default Protected;
