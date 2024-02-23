import Dropdown from "./components/Dropdown/Dropdown";
import "./App.css";

import { CustomerOnboarding, Login } from "./pages";
import { Route, Routes } from "react-router-dom";
import { AuthContext } from "./context";
import Protected from "./hocs/protected/Protected";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { isEmpty } from "lodash";
import { Toaster } from "./components";
import { toast } from "react-toastify";
import NFC from "./pages/NFC/nfc";
import CreateUser from "./CreateUser";

function App() {
  // dummy data sent to select components
  const { lostAuth, user, error, isGlobalError} = useSelector(rState => rState.userSlice)
  const contextVal = isEmpty(user) ? JSON.parse(sessionStorage.getItem('userData')) : user
  const [context, setContext] = useState(contextVal);
  useEffect(()=>{
    if(lostAuth){
        setContext({})
    }
  }, [lostAuth])

  useEffect(()=>{
    if(isGlobalError){
        toast.error("something went wrong try again later");
    }
  }, [isGlobalError])

  return (
    <div className="App">
        <Toaster />
      <AuthContext.Provider value={[context, setContext]}>
        <Routes>
          <Route path="/" exact element={<Login />} />
          <Route
              path="/customer-onboarding"
              exact
              element={<CustomerOnboarding />}
            />
            <Route
              path="/nfc-test/:id"
              exact
              element={<NFC />}
            />
          <Route path="/authorised/*" element={<Protected />} />
          <Route path="/createUser/*" element={<CreateUser />} />
        </Routes>
      </AuthContext.Provider>
    </div>
  );
}

export default App;
