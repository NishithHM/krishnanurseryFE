import React, { useContext, useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context";
import {
  AccessManagement,
  AddProcurement,
  Categories,
  CustomerOnboarding,
  Dashboard,
  Employee,
  ProcurementList,
  Test,
  AddBills
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
              path="/customer-onboarding"
              exact
              element={<CustomerOnboarding />}
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
            <Route path="/dashboard/add-bills" exact element={<AddBills />}/>
             <Route
              path="/dashboard/categories"
              exact
              element={<Categories />}
            />
          </Routes>
        </div>
        <Footer />
      </>
    );
  }
};

export default Protected;
