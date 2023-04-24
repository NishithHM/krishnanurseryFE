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
} from "../../pages";
import { isEmpty } from "lodash";
import { Footer, Header } from "../../components";

const Protected = () => {
  const [context, setContext] = useContext(AuthContext);
  const [isAuthorised, setAuthorised] = useState(false);
  const navigate = useNavigate();
  // console.log(context)
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
            <Route
              path="/dashboard/add-procurement"
              exact
              element={<AddProcurement />}
            />
            <Route
              path="/dashboard/procurement-list"
              exact
              element={<ProcurementList />}
            />

            <Route path="/dashboard/bills" exact element={<Bills />} />
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
              path="/dashboard/waste-management"
              exact
              element={<WasteManagement/>}
            />
          </Routes>
        </div>
        <Footer />
      </>
    );
  }
};

export default Protected;
